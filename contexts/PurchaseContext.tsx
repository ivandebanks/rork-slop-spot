import { useState, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_SCANS_KEY = "@slop_spot_daily_scans";
const LAST_RESET_KEY = "@slop_spot_last_reset";
const PREMIUM_KEY = "@slop_spot_premium";

export const [PurchaseProvider, usePurchases] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [dailyScansUsed, setDailyScansUsed] = useState(0);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const premiumQuery = useQuery({
    queryKey: ["premium"],
    queryFn: async () => {
      const premium = await AsyncStorage.getItem(PREMIUM_KEY);
      return premium === "true";
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
  };
});
