import { Linking, Platform, Share, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import type { ScanResult } from "@/types/scan";

export async function openURL(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  } catch (error) {
    // URL open failed silently
  }
}

export function buildShareMessage(scan: ScanResult): string {
  const ingredientsList = scan.ingredients
    .map((ing, idx) => `${idx + 1}. ${ing.name} (${Math.round(ing.rating)}/100)`)
    .join("\n");

  return `${scan.productName} - Health Score: ${Math.round(scan.overallScore)}/100 (${scan.gradeLabel})

Ingredients (${scan.ingredients.length}):
${ingredientsList}

Scanned with Kiwi - Better Health Scanner
Download: https://apps.apple.com/app/id6757214914`;
}

export async function shareScan(scan: ScanResult): Promise<boolean> {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  try {
    const message = buildShareMessage(scan);
    await Share.share({
      message,
      title: `${scan.productName} Health Scan`,
    });
    return true;
  } catch (error: any) {
    Alert.alert("Unable to Share", "Something went wrong while sharing. Please try again.");
    return false;
  }
}
