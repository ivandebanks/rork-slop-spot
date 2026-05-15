import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { shouldShowPromo } from "@/components/CrossPromo";
import type { ScanResult } from "@/types/scan";
import { SCAN_COUNT_KEY, COUNTER_KEY, SCANS_BETWEEN_PROMOS } from "../constants";

export type ActivePromo = "peptide" | "regrow";

export function useCrossPromo(scan: ScanResult | undefined) {
  const [promoVisible, setPromoVisible] = useState(false);
  const [activePromo, setActivePromo] = useState<ActivePromo>("peptide");

  // Cross-promo: show 8 seconds after results load, alternating between Math and Regrow
  useEffect(() => {
    if (!scan) return;

    const checkAndShowPromo = async () => {
      try {
        // Increment scan count
        const countStr = await AsyncStorage.getItem(SCAN_COUNT_KEY);
        const scanCount = (countStr ? parseInt(countStr, 10) : 0) + 1;
        await AsyncStorage.setItem(SCAN_COUNT_KEY, String(scanCount));

        // Only show promo every few scans
        if (scanCount % SCANS_BETWEEN_PROMOS !== 0) return;

        // Alternate between Peptide Hub and Regrow
        const counterStr = await AsyncStorage.getItem(COUNTER_KEY);
        const counter = counterStr ? parseInt(counterStr, 10) : 0;
        const isPeptideTurn = counter % 2 === 0;

        const primaryKey = isPeptideTurn ? "promo_peptide" : "promo_regrow";
        const fallbackKey = isPeptideTurn ? "promo_regrow" : "promo_peptide";

        let canShow = await shouldShowPromo(primaryKey);
        let chosenPromo: ActivePromo = isPeptideTurn ? "peptide" : "regrow";

        if (!canShow) {
          canShow = await shouldShowPromo(fallbackKey);
          chosenPromo = isPeptideTurn ? "regrow" : "peptide";
        }

        if (canShow) {
          setActivePromo(chosenPromo);
          setPromoVisible(true);
          await AsyncStorage.setItem(COUNTER_KEY, String(counter + 1));
        }
      } catch {
        // silent
      }
    };

    const timer = setTimeout(checkAndShowPromo, 2000);
    return () => clearTimeout(timer);
  }, [scan?.id]);

  return { promoVisible, setPromoVisible, activePromo };
}
