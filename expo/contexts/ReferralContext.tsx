import { useEffect, useState, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform, Dimensions } from "react-native";

const REFERRAL_SECRET_KEY = "@kiwi_referral_secret";
const REFERRAL_COUNT_KEY = "@kiwi_referral_count";
const REFERRAL_PREMIUM_KEY = "@kiwi_referral_premium";
const REFERRAL_PREMIUM_EXPIRY_KEY = "@kiwi_referral_premium_expiry";
const REFERRAL_USED_CODES_KEY = "@kiwi_referral_used_codes";
const REFERRAL_DEVICE_KEY = "@kiwi_device_fingerprint";
const REFERRAL_FAIL_COUNT_KEY = "@kiwi_referral_fails";
const REFERRAL_LOCKOUT_KEY = "@kiwi_referral_lockout";

// Code validity window: 2 days in milliseconds
const CODE_EXPIRY_MS = 2 * 24 * 60 * 60 * 1000;
// Lockout duration: 36 hours in milliseconds
const LOCKOUT_MS = 36 * 60 * 60 * 1000;
// Max failed attempts before lockout
const MAX_FAILS = 3;

// Generate a stable device fingerprint that survives reinstalls
function generateDeviceFingerprint(): string {
  const parts: string[] = [];

  // Installation ID from expo-constants (changes on reinstall but good as component)
  if (Constants.installationId) {
    parts.push(Constants.installationId);
  }

  // Device characteristics that don't change
  const screen = Dimensions.get("screen");
  parts.push(`${screen.width}x${screen.height}`);
  parts.push(`${screen.scale}`);
  parts.push(Platform.OS);
  parts.push(Platform.Version?.toString() || "");

  // Simple hash of the combined string
  const combined = parts.join("|");
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

// Generate a random alphanumeric string
function randomString(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// XOR-based encode with a static key
function encodePayload(data: string): string {
  const key = "KIWI";
  let encoded = "";
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encoded += charCode.toString(16).padStart(2, "0");
  }
  return encoded.toUpperCase();
}

function decodePayload(encoded: string): string {
  const key = "KIWI";
  let decoded = "";
  for (let i = 0; i < encoded.length; i += 2) {
    const charCode = parseInt(encoded.substr(i, 2), 16) ^ key.charCodeAt((i / 2) % key.length);
    decoded += String.fromCharCode(charCode);
  }
  return decoded;
}

// Invite code: SECRET|DEVICEFP|TIMESTAMP
export function generateInviteCode(secret: string, deviceFp: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${secret}|${deviceFp}|${timestamp}`;
  const encoded = encodePayload(payload);
  return `KW-${encoded}`;
}

export function parseInviteCode(code: string): { senderSecret: string; senderDevice: string; timestamp: number } | null {
  try {
    if (!code.startsWith("KW-")) return null;
    const encoded = code.substring(3);
    const decoded = decodePayload(encoded);
    const parts = decoded.split("|");
    if (parts.length !== 3) return null;
    const senderSecret = parts[0];
    const senderDevice = parts[1];
    const timestamp = parseInt(parts[2], 36);
    if (isNaN(timestamp)) return null;
    return { senderSecret, senderDevice, timestamp };
  } catch {
    return null;
  }
}

// Confirmation code: SENDER_SECRET|RECEIVER_SECRET|RECEIVER_DEVICE|TIMESTAMP
export function generateConfirmationCode(senderSecret: string, receiverSecret: string, receiverDevice: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${senderSecret}|${receiverSecret}|${receiverDevice}|${timestamp}`;
  const encoded = encodePayload(payload);
  return `KC-${encoded}`;
}

export function parseConfirmationCode(code: string): { senderSecret: string; receiverSecret: string; receiverDevice: string; timestamp: number } | null {
  try {
    if (!code.startsWith("KC-")) return null;
    const encoded = code.substring(3);
    const decoded = decodePayload(encoded);
    const parts = decoded.split("|");
    if (parts.length !== 4) return null;
    const senderSecret = parts[0];
    const receiverSecret = parts[1];
    const receiverDevice = parts[2];
    const timestamp = parseInt(parts[3], 36);
    if (isNaN(timestamp)) return null;
    return { senderSecret, receiverSecret, receiverDevice, timestamp };
  } catch {
    return null;
  }
}

export const [ReferralProvider, useReferral] = createContextHook(() => {
  const [mySecret, setMySecret] = useState<string>("");
  const [myDeviceFp, setMyDeviceFp] = useState<string>("");
  const [referralCount, setReferralCount] = useState(0);
  const [hasReferralPremium, setHasReferralPremium] = useState(false);
  const [referralPremiumExpiry, setReferralPremiumExpiry] = useState<number | null>(null);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [usedDevices, setUsedDevices] = useState<string[]>([]);
  const [failCount, setFailCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeReferral();
  }, []);

  // Check premium expiry periodically
  useEffect(() => {
    if (!referralPremiumExpiry) return;
    const check = () => {
      if (Date.now() > referralPremiumExpiry) {
        setHasReferralPremium(false);
        setReferralPremiumExpiry(null);
        AsyncStorage.removeItem(REFERRAL_PREMIUM_KEY).catch(() => {});
        AsyncStorage.removeItem(REFERRAL_PREMIUM_EXPIRY_KEY).catch(() => {});
      }
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [referralPremiumExpiry]);

  const initializeReferral = async () => {
    try {
      // Generate device fingerprint
      const deviceFp = generateDeviceFingerprint();
      setMyDeviceFp(deviceFp);

      // Store device fingerprint (for cross-reference)
      await AsyncStorage.setItem(REFERRAL_DEVICE_KEY, deviceFp);

      // Get or create secret
      let secret = await AsyncStorage.getItem(REFERRAL_SECRET_KEY);
      if (!secret) {
        secret = randomString(8);
        await AsyncStorage.setItem(REFERRAL_SECRET_KEY, secret);
      }
      setMySecret(secret);

      // Load referral count
      const countStr = await AsyncStorage.getItem(REFERRAL_COUNT_KEY);
      setReferralCount(countStr ? parseInt(countStr, 10) : 0);

      // Load premium status
      const premiumStr = await AsyncStorage.getItem(REFERRAL_PREMIUM_KEY);
      const expiryStr = await AsyncStorage.getItem(REFERRAL_PREMIUM_EXPIRY_KEY);
      if (premiumStr === "true" && expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        if (Date.now() < expiry) {
          setHasReferralPremium(true);
          setReferralPremiumExpiry(expiry);
        } else {
          await AsyncStorage.removeItem(REFERRAL_PREMIUM_KEY);
          await AsyncStorage.removeItem(REFERRAL_PREMIUM_EXPIRY_KEY);
        }
      }

      // Load used codes and devices
      const usedStr = await AsyncStorage.getItem(REFERRAL_USED_CODES_KEY);
      if (usedStr) {
        const parsed = JSON.parse(usedStr);
        // Support both old format (string[]) and new format ({codes, devices})
        if (Array.isArray(parsed)) {
          setUsedCodes(parsed);
          setUsedDevices([]);
        } else {
          setUsedCodes(parsed.codes || []);
          setUsedDevices(parsed.devices || []);
        }
      }

      // Load fail count and lockout
      const failStr = await AsyncStorage.getItem(REFERRAL_FAIL_COUNT_KEY);
      if (failStr) setFailCount(parseInt(failStr, 10));

      const lockStr = await AsyncStorage.getItem(REFERRAL_LOCKOUT_KEY);
      if (lockStr) {
        const lockTime = parseInt(lockStr, 10);
        if (Date.now() < lockTime) {
          setLockoutUntil(lockTime);
        } else {
          // Lockout expired, reset fails
          await AsyncStorage.removeItem(REFERRAL_LOCKOUT_KEY);
          await AsyncStorage.removeItem(REFERRAL_FAIL_COUNT_KEY);
          setFailCount(0);
          setLockoutUntil(null);
        }
      }
    } catch (error) {
      // Failed to initialize referral system
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsedData = async (codes: string[], devices: string[]) => {
    await AsyncStorage.setItem(REFERRAL_USED_CODES_KEY, JSON.stringify({ codes, devices }));
  };

  const recordFail = async () => {
    const newFails = failCount + 1;
    setFailCount(newFails);
    await AsyncStorage.setItem(REFERRAL_FAIL_COUNT_KEY, newFails.toString());

    if (newFails >= MAX_FAILS) {
      const lockTime = Date.now() + LOCKOUT_MS;
      setLockoutUntil(lockTime);
      await AsyncStorage.setItem(REFERRAL_LOCKOUT_KEY, lockTime.toString());
    }
  };

  const resetFailsOnSuccess = async () => {
    setFailCount(0);
    await AsyncStorage.removeItem(REFERRAL_FAIL_COUNT_KEY);
    await AsyncStorage.removeItem(REFERRAL_LOCKOUT_KEY);
    setLockoutUntil(null);
  };

  const isLockedOut = useCallback((): boolean => {
    if (!lockoutUntil) return false;
    if (Date.now() >= lockoutUntil) {
      // Auto-clear expired lockout
      setLockoutUntil(null);
      setFailCount(0);
      AsyncStorage.removeItem(REFERRAL_LOCKOUT_KEY).catch(() => {});
      AsyncStorage.removeItem(REFERRAL_FAIL_COUNT_KEY).catch(() => {});
      return false;
    }
    return true;
  }, [lockoutUntil]);

  const getLockoutTimeLeft = useCallback((): string => {
    if (!lockoutUntil) return "";
    const remaining = lockoutUntil - Date.now();
    if (remaining <= 0) return "";
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }, [lockoutUntil]);

  // Get my invite code to share
  const getMyInviteCode = useCallback((): string => {
    if (!mySecret || !myDeviceFp) return "";
    return generateInviteCode(mySecret, myDeviceFp);
  }, [mySecret, myDeviceFp]);

  // Person B enters Person A's invite code
  const redeemInviteCode = useCallback(async (code: string): Promise<{ confirmationCode: string } | { error: string }> => {
    // Check lockout
    if (isLockedOut()) {
      return { error: `Too many failed attempts. Try again in ${getLockoutTimeLeft()}.` };
    }

    const parsed = parseInviteCode(code);
    if (!parsed) {
      await recordFail();
      const remaining = MAX_FAILS - failCount - 1;
      return { error: `Invalid referral code.${remaining > 0 ? ` ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` : " You are now locked out for 36 hours."}` };
    }

    // Check expiry
    if (Date.now() - parsed.timestamp > CODE_EXPIRY_MS) {
      await recordFail();
      return { error: "This referral code has expired (2-day limit)." };
    }

    // Check if it's own code (by secret)
    if (parsed.senderSecret === mySecret) {
      await recordFail();
      return { error: "You can't use your own referral code." };
    }

    // Check if same device fingerprint (reinstall detection)
    if (parsed.senderDevice === myDeviceFp) {
      await recordFail();
      return { error: "You can't use your own referral code." };
    }

    // Check if already used this sender's code
    if (usedCodes.includes(parsed.senderSecret)) {
      return { error: "You've already used a code from this person." };
    }

    // Check if already used this sender's device
    if (usedDevices.includes(parsed.senderDevice)) {
      return { error: "You've already used a code from this device." };
    }

    // Success — mark as used
    const newCodes = [...usedCodes, parsed.senderSecret];
    const newDevices = [...usedDevices, parsed.senderDevice];
    setUsedCodes(newCodes);
    setUsedDevices(newDevices);
    await saveUsedData(newCodes, newDevices);
    await resetFailsOnSuccess();

    const confirmCode = generateConfirmationCode(parsed.senderSecret, mySecret, myDeviceFp);
    return { confirmationCode: confirmCode };
  }, [mySecret, myDeviceFp, usedCodes, usedDevices, failCount, isLockedOut, getLockoutTimeLeft]);

  // Person A enters the confirmation code from Person B
  const redeemConfirmationCode = useCallback(async (code: string): Promise<{ success: boolean; newCount: number } | { error: string }> => {
    // Check lockout
    if (isLockedOut()) {
      return { error: `Too many failed attempts. Try again in ${getLockoutTimeLeft()}.` };
    }

    const parsed = parseConfirmationCode(code);
    if (!parsed) {
      await recordFail();
      const remaining = MAX_FAILS - failCount - 1;
      return { error: `Invalid confirmation code.${remaining > 0 ? ` ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` : " You are now locked out for 36 hours."}` };
    }

    // Check expiry
    if (Date.now() - parsed.timestamp > CODE_EXPIRY_MS) {
      await recordFail();
      return { error: "This confirmation code has expired (2-day limit)." };
    }

    // Verify the sender secret matches ours
    if (parsed.senderSecret !== mySecret) {
      await recordFail();
      const remaining = MAX_FAILS - failCount - 1;
      return { error: `This confirmation code wasn't generated for you.${remaining > 0 ? ` ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` : " You are now locked out for 36 hours."}` };
    }

    // Check if receiver's device matches our device (same device gaming)
    if (parsed.receiverDevice === myDeviceFp) {
      await recordFail();
      return { error: "This referral came from the same device." };
    }

    // Check if we already counted this referrer (by secret)
    if (usedCodes.includes(parsed.receiverSecret)) {
      return { error: "You've already counted this referral." };
    }

    // Check if we already counted this device
    if (usedDevices.includes(parsed.receiverDevice)) {
      return { error: "You've already counted a referral from this device." };
    }

    // Success — mark receiver as counted
    const newCodes = [...usedCodes, parsed.receiverSecret];
    const newDevices = [...usedDevices, parsed.receiverDevice];
    setUsedCodes(newCodes);
    setUsedDevices(newDevices);
    await saveUsedData(newCodes, newDevices);
    await resetFailsOnSuccess();

    // Increment referral count
    const newCount = referralCount + 1;
    setReferralCount(newCount);
    await AsyncStorage.setItem(REFERRAL_COUNT_KEY, newCount.toString());

    // Check if they earned premium
    await checkAndGrantPremium(newCount);

    return { success: true, newCount };
  }, [mySecret, myDeviceFp, usedCodes, usedDevices, referralCount, failCount, isLockedOut, getLockoutTimeLeft]);

  const checkAndGrantPremium = async (count: number) => {
    let daysToGrant = 0;

    if (count >= 5) {
      daysToGrant = 30;
    } else if (count >= 2) {
      daysToGrant = 7;
    }

    if (daysToGrant > 0) {
      const currentExpiry = referralPremiumExpiry || Date.now();
      const newExpiry = Math.max(currentExpiry, Date.now()) + daysToGrant * 24 * 60 * 60 * 1000;
      setHasReferralPremium(true);
      setReferralPremiumExpiry(newExpiry);
      await AsyncStorage.setItem(REFERRAL_PREMIUM_KEY, "true");
      await AsyncStorage.setItem(REFERRAL_PREMIUM_EXPIRY_KEY, newExpiry.toString());
    }
  };

  const getReferralPremiumDaysLeft = useCallback((): number => {
    if (!referralPremiumExpiry) return 0;
    const remaining = referralPremiumExpiry - Date.now();
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  }, [referralPremiumExpiry]);

  return {
    isLoading,
    mySecret,
    referralCount,
    hasReferralPremium,
    failCount,
    isLockedOut: isLockedOut(),
    getLockoutTimeLeft,
    getMyInviteCode,
    redeemInviteCode,
    redeemConfirmationCode,
    getReferralPremiumDaysLeft,
  };
});
