import { useState, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, { PurchasesOfferings } from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

const REFERRAL_PREMIUM_KEY = "@kiwi_referral_premium";
const REFERRAL_PREMIUM_EXPIRY_KEY = "@kiwi_referral_premium_expiry";

const DAILY_SCANS_KEY = "@slop_spot_daily_scans";
const LAST_RESET_KEY = "@slop_spot_last_reset";
const PREMIUM_KEY = "@slop_spot_premium";

let isRevenueCatConfigured = false;
let configurePromise: Promise<boolean> | null = null;

const configureRevenueCat = async (): Promise<boolean> => {
  if (isRevenueCatConfigured) return true;

  try {
    const isExpoGo = Constants.appOwnership === "expo";
    let apiKey = "";

    if (isExpoGo) {
      // Expo Go doesn't have native store access — must use RevenueCat Test Store key
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY || "";
      console.log("Expo Go detected — using Test Store API key");
    } else if (Platform.OS === "ios") {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "";
    } else if (Platform.OS === "android") {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "";
    } else {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY || "";
    }

    if (apiKey) {
      await Purchases.configure({ apiKey });
      isRevenueCatConfigured = true;
      console.log("RevenueCat configured successfully for platform:", Platform.OS, isExpoGo ? "(Expo Go)" : "(Dev Build)");
      return true;
    }
    console.log("RevenueCat API key not found. Platform:", Platform.OS, "ExpoGo:", isExpoGo);
    return false;
  } catch (error: any) {
    // Log but don't use console.error — it triggers the red error overlay in dev mode.
    // RevenueCat failures in Expo Go / missing native modules are expected.
    console.log("RevenueCat configure skipped:", error?.message || error);
    return false;
  }
};

// Ensure configure only runs once per attempt; reset on failure so retries work
const ensureConfigured = (): Promise<boolean> => {
  if (!configurePromise) {
    configurePromise = configureRevenueCat().then((result) => {
      if (!result) {
        // Reset so next call will retry
        configurePromise = null;
      }
      return result;
    });
  }
  return configurePromise;
};


export const [PurchaseProvider, usePurchases] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [dailyScansUsed, setDailyScansUsed] = useState(0);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configAttempted, setConfigAttempted] = useState(false);

  useEffect(() => {
    ensureConfigured().then((configured) => {
      setIsConfigured(configured);
      setConfigAttempted(true);
    });
  }, []);

  const premiumQuery = useQuery({
    queryKey: ["premium"],
    queryFn: async () => {
      // Wait for RevenueCat to be configured before querying
      const configured = await ensureConfigured();
      if (!configured) {
        const stored = await AsyncStorage.getItem(PREMIUM_KEY);
        return stored === "true";
      }
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPremium = customerInfo.entitlements.active["premium"] !== undefined;
        await AsyncStorage.setItem(PREMIUM_KEY, isPremium.toString());
        return isPremium;
      } catch (error) {
        console.log("Failed to get customer info:", error);
        const stored = await AsyncStorage.getItem(PREMIUM_KEY);
        return stored === "true";
      }
    },
    enabled: configAttempted,
  });

  const offeringsQuery = useQuery({
    queryKey: ["offerings"],
    queryFn: async () => {
      // Wait for RevenueCat to be configured before fetching offerings
      const configured = await ensureConfigured();
      if (!configured) {
        console.log("RevenueCat not configured — cannot fetch offerings");
        throw new Error("RevenueCat not configured");
      }
      const offerings = await Purchases.getOfferings();
      console.log("Offerings fetched:", offerings?.current?.identifier, "packages:", offerings?.current?.availablePackages?.length);
      if (!offerings?.current) {
        throw new Error("No current offering found in RevenueCat");
      }
      return offerings;
    },
    enabled: configAttempted,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  const dailyScansQuery = useQuery({
    queryKey: ["dailyScans"],
    queryFn: async () => {
      const lastReset = await AsyncStorage.getItem(LAST_RESET_KEY);
      const today = new Date().toDateString();

      if (lastReset !== today) {
        await AsyncStorage.setItem(LAST_RESET_KEY, today);
        await AsyncStorage.setItem(DAILY_SCANS_KEY, "0");
        return 0;
      }

      const used = await AsyncStorage.getItem(DAILY_SCANS_KEY);
      return used ? parseInt(used, 10) : 0;
    },
  });

  useEffect(() => {
    if (dailyScansQuery.data !== undefined) {
      setDailyScansUsed(dailyScansQuery.data);
    }
  }, [dailyScansQuery.data]);

  useEffect(() => {
    if (premiumQuery.data !== undefined) {
      setHasPremiumAccess(premiumQuery.data);
    }
  }, [premiumQuery.data]);

  const useScanMutation = useMutation({
    mutationFn: async () => {
      const used = dailyScansUsed + 1;
      await AsyncStorage.setItem(DAILY_SCANS_KEY, used.toString());
      return used;
    },
    onSuccess: (used) => {
      setDailyScansUsed(used);
      queryClient.invalidateQueries({ queryKey: ["dailyScans"] });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      await ensureConfigured();
      try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        return customerInfo;
      } catch (error: any) {
        if (error.userCancelled) {
          throw new Error("Purchase cancelled");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      await ensureConfigured();
      try {
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo;
      } catch (error) {
        console.log("Failed to restore purchases:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium"] });
    },
  });

  // Check referral premium too
  const [hasReferralPremium, setHasReferralPremium] = useState(false);

  useEffect(() => {
    const checkReferralPremium = async () => {
      try {
        const premiumStr = await AsyncStorage.getItem(REFERRAL_PREMIUM_KEY);
        const expiryStr = await AsyncStorage.getItem(REFERRAL_PREMIUM_EXPIRY_KEY);
        if (premiumStr === "true" && expiryStr) {
          const expiry = parseInt(expiryStr, 10);
          setHasReferralPremium(Date.now() < expiry);
        }
      } catch {}
    };
    checkReferralPremium();
    const interval = setInterval(checkReferralPremium, 30000);
    return () => clearInterval(interval);
  }, []);

  const effectivePremium = hasPremiumAccess || hasReferralPremium;

  const canScan = (): boolean => {
    if (effectivePremium) return true;
    if (dailyScansUsed < 2) return true;
    return false;
  };

  const getScansRemaining = (): string => {
    if (effectivePremium) return "Unlimited";
    const remaining = Math.max(0, 2 - dailyScansUsed);
    return `${remaining} free today`;
  };

  return {
    isLoading: premiumQuery.isLoading || dailyScansQuery.isLoading,
    useScanMutation,
    hasPremium: effectivePremium,
    canScan: canScan(),
    scansRemaining: getScansRemaining(),
    dailyScansUsed,
    offerings: offeringsQuery.data ?? null,
    isLoadingOfferings: offeringsQuery.isLoading || offeringsQuery.isFetching || !configAttempted,
    offeringsError: offeringsQuery.error,
    refetchOfferings: offeringsQuery.refetch,
    purchaseMutation,
    restoreMutation,
  };
});
