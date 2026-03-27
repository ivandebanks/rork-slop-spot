import AsyncStorage from "@react-native-async-storage/async-storage";

const PAYWALL_SEEN_KEY = "@slop_spot_paywall_seen";
const PAYWALL_ABANDONED_KEY = "@slop_spot_paywall_abandoned";
const PAYWALL_ABANDONED_AT_KEY = "@slop_spot_paywall_abandoned_at";
const RECOVERY_SHOWN_KEY = "@slop_spot_recovery_shown";
const RECOVERY_COOLDOWN_KEY = "@slop_spot_recovery_cooldown";

// Minimum time (ms) after abandoning before showing recovery (2 hours)
const MIN_RECOVERY_DELAY_MS = 2 * 60 * 60 * 1000;
// Cooldown between recovery paywall shows (24 hours)
const RECOVERY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function markPaywallSeen(): Promise<void> {
  await AsyncStorage.setItem(PAYWALL_SEEN_KEY, "true");
}

export async function markPaywallAbandoned(): Promise<void> {
  await AsyncStorage.setItem(PAYWALL_ABANDONED_KEY, "true");
  await AsyncStorage.setItem(PAYWALL_ABANDONED_AT_KEY, Date.now().toString());
}

export async function markRecoveryShown(): Promise<void> {
  await AsyncStorage.setItem(RECOVERY_SHOWN_KEY, "true");
  await AsyncStorage.setItem(RECOVERY_COOLDOWN_KEY, Date.now().toString());
}

export async function resetAbandonState(): Promise<void> {
  await AsyncStorage.multiRemove([
    PAYWALL_ABANDONED_KEY,
    PAYWALL_ABANDONED_AT_KEY,
  ]);
}

export async function shouldShowRecoveryPaywall(): Promise<boolean> {
  try {
    const [abandoned, abandonedAt, cooldown] = await AsyncStorage.multiGet([
      PAYWALL_ABANDONED_KEY,
      PAYWALL_ABANDONED_AT_KEY,
      RECOVERY_COOLDOWN_KEY,
    ]);

    // Must have abandoned the paywall
    if (abandoned[1] !== "true") return false;

    // Must have waited the minimum delay
    const abandonedTime = parseInt(abandonedAt[1] || "0", 10);
    if (Date.now() - abandonedTime < MIN_RECOVERY_DELAY_MS) return false;

    // Must respect cooldown between recovery shows
    const lastCooldown = parseInt(cooldown[1] || "0", 10);
    if (lastCooldown > 0 && Date.now() - lastCooldown < RECOVERY_COOLDOWN_MS) return false;

    return true;
  } catch (error) {
    console.log("Error checking recovery paywall state:", error);
    return false;
  }
}
