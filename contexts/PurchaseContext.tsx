import { useState, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, { PurchasesOfferings } from "react-native-purchases";
import { Platform } from "react-native";

const DAILY_SCANS_KEY = "@slop_spot_daily_scans";
const LAST_RESET_KEY = "@slop_spot_last_reset";
const PREMIUM_KEY = "@slop_spot_premium";

let isRevenueCatConfigured = false;

const configureRevenueCat = async () => {
  if (isRevenueCatConfigured) return;
  
  try {
    let apiKey = "";
    
    if (Platform.OS === "ios") {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "";
    } else if (Platform.OS === "android") {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "";
    } else {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY || "";
    }

    if (apiKey) {
      await Purchases.configure({ apiKey });
      isRevenueCatConfigured = true;
      console.log("RevenueCat configured successfully");
    }
  } catch (error) {
    console.error("Failed to configure RevenueCat:", error);
  }
};

export const [PurchaseProvider, usePurchases] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [dailyScansUsed, setDailyScansUsed] = useState(0);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  useEffect(() => {
    configureRevenueCat();
  }, []);

  const premiumQuery = useQuery({
    queryKey: ["premium"],
    queryFn: async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPremium = customerInfo.entitlements.active["premium"] !== undefined;
        await AsyncStorage.setItem(PREMIUM_KEY, isPremium.toString());
        return isPremium;
      } catch (error) {
        console.error("Failed to get customer info:", error);
        const stored = await AsyncStorage.getItem(PREMIUM_KEY);
        return stored === "true";
      }
    },
  });

  const offeringsQuery = useQuery({
    queryKey: ["offerings"],
    queryFn: async () => {
      try {
        const offerings = await Purchases.getOfferings();
        return offerings;
      } catch (error) {
        console.error("Failed to get offerings:", error);
        return null;
      }
    },
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
      try {
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo;
      } catch (error) {
        console.error("Failed to restore purchases:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium"] });
    },
  });

  const canScan = (): boolean => {
    if (hasPremiumAccess) return true;
    if (dailyScansUsed < 2) return true;
    return false;
  };

  const getScansRemaining = (): string => {
    if (hasPremiumAccess) return "Unlimited";
    const remaining = Math.max(0, 2 - dailyScansUsed);
    return `${remaining} free today`;
  };

  return {
    isLoading: premiumQuery.isLoading || dailyScansQuery.isLoading,
    useScanMutation,
    hasPremium: hasPremiumAccess,
    canScan: canScan(),
    scansRemaining: getScansRemaining(),
    dailyScansUsed,
    offerings: offeringsQuery.data,
    isLoadingOfferings: offeringsQuery.isLoading,
    purchaseMutation,
    restoreMutation,
  };
});
