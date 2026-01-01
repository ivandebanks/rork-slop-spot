import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ScanResult } from "@/types/scan";

const STORAGE_KEY = "slop_spot_scans";

export const [ScanProvider, useScans] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [scans, setScans] = useState<ScanResult[]>([]);

  const scansQuery = useQuery({
    queryKey: ["scans"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.log("Error loading scans:", error);
        await AsyncStorage.removeItem(STORAGE_KEY);
        return [];
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newScans: ScanResult[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newScans));
      return newScans;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
  });

  useEffect(() => {
    if (scansQuery.data) {
      setScans(scansQuery.data);
    }
  }, [scansQuery.data]);

  const addScan = (scan: ScanResult) => {
    const updated = [scan, ...scans];
    setScans(updated);
    saveMutation.mutate(updated);
  };

  const deleteScan = (id: string) => {
    const updated = scans.filter((s) => s.id !== id);
    setScans(updated);
    saveMutation.mutate(updated);
  };

  return {
    scans,
    addScan,
    deleteScan,
    isLoading: scansQuery.isLoading,
  };
});
