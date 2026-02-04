import { useState, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_SCANS_KEY = "@slop_spot_daily_scans";
const LAST_RESET_KEY = "@slop_spot_last_reset";

function getRCToken() {
  if (__DEV__ || Platform.OS === "web") return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

const apiKey = getRCToken();
console.log("=== RevenueCat Configuration ===");
console.log("Platform:", Platform.OS);
console.log("Dev mode:", __DEV__);
console.log("API Key present:", !!apiKey);
console.log("API Key (first 10 chars):", apiKey?.substring(0, 10));

if (apiKey) {
  try {
    Purchases.configure({ apiKey });
    console.log("RevenueCat configured successfully");
  } catch (error) {
    console.error("Error configuring RevenueCat:", error);
  }
} else {
  console.error("No RevenueCat API key found!");
}

export const [PurchaseProvider, usePurchases] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [scanCredits, setScanCredits] = useState(0);
  const [dailyScansUsed, setDailyScansUsed] = useState(0);

  const customerInfoQuery = useQuery({
    queryKey: ["customerInfo"],
    queryFn: async () => {
      const info = await Purchases.getCustomerInfo();
      return info;
    },
    refetchInterval: 30000,
  });

  const offeringsQuery = useQuery({
    queryKey: ["offerings"],
    queryFn: async () => {
      try {
        console.log("Fetching offerings from RevenueCat...");
        const offerings = await Purchases.getOfferings();
        console.log("Offerings fetched:", offerings);
        return offerings;
      } catch (error) {
        console.error("Error fetching offerings:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
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
    if (customerInfoQuery.data) {
      const info = customerInfoQuery.data;
      const credits = parseInt(info.nonSubscriptionTransactions
        .filter((t) => t.productIdentifier.includes("scans_"))
        .reduce((sum, t) => sum + getCreditsFromProduct(t.productIdentifier), 0)
        .toString(), 10);
      setScanCredits(credits);
    }
  }, [customerInfoQuery.data]);

  const getCreditsFromProduct = (productId: string): number => {
    if (productId.includes("scans_1")) return 1;
    if (productId.includes("scans_3")) return 3;
    if (productId.includes("scans_5")) return 5;
    if (productId.includes("scans_10")) return 10;
    if (productId.includes("scans_20")) return 20;
    if (productId.includes("scans_30")) return 30;
    return 0;
  };

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: PurchasesPackage) => {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const info = await Purchases.restorePurchases();
      return info;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
    },
  });

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

  const hasPremium = (): boolean => {
    return customerInfoQuery.data?.entitlements.active["premium"] !== undefined;
  };

  const canScan = (): boolean => {
    if (hasPremium()) return true;
    if (scanCredits > 0) return true;
    if (dailyScansUsed < 2) return true;
    return false;
  };

  const getScansRemaining = (): string => {
    if (hasPremium()) return "Unlimited";
    if (scanCredits > 0) return scanCredits.toString();
    const remaining = Math.max(0, 2 - dailyScansUsed);
    return `${remaining} free today`;
  };

  return {
    customerInfo: customerInfoQuery.data,
    offerings: offeringsQuery.data,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    error: offeringsQuery.error || customerInfoQuery.error,
    purchaseMutation,
    restoreMutation,
    useScanMutation,
    hasPremium: hasPremium(),
    canScan: canScan(),
    scansRemaining: getScansRemaining(),
    scanCredits,
    dailyScansUsed,
  };
});
