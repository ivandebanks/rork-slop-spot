import { useEffect, useState, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REFERRAL_SECRET_KEY = "@kiwi_referral_secret";
const REFERRAL_COUNT_KEY = "@kiwi_referral_count";
const REFERRAL_PREMIUM_KEY = "@kiwi_referral_premium";
const REFERRAL_PREMIUM_EXPIRY_KEY = "@kiwi_referral_premium_expiry";
const REFERRAL_USED_CODES_KEY = "@kiwi_referral_used_codes";

// Code validity window: 2 days in milliseconds
const CODE_EXPIRY_MS = 2 * 24 * 60 * 60 * 1000;

// Generate a random 6-char alphanumeric string
function randomString(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Simple obfuscation: XOR-based encode with a static key, then base32-ish
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

// Generate an invite code: contains sender's secret + timestamp
// Format: SECRET|TIMESTAMP encoded
export function generateInviteCode(secret: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${secret}|${timestamp}`;
  const encoded = encodePayload(payload);
  return `KW-${encoded}`;
}

// Parse an invite code to extract sender secret and timestamp
export function parseInviteCode(code: string): { senderSecret: string; timestamp: number } | null {
  try {
    if (!code.startsWith("KW-")) return null;
    const encoded = code.substring(3);
    const decoded = decodePayload(encoded);
    const parts = decoded.split("|");
    if (parts.length !== 2) return null;
    const senderSecret = parts[0];
    const timestamp = parseInt(parts[1], 36);
    if (isNaN(timestamp)) return null;
    return { senderSecret, timestamp };
  } catch {
    return null;
  }
}

// Generate a confirmation code: contains sender's secret + receiver's secret + timestamp
// This is what Person B sends back to Person A
export function generateConfirmationCode(senderSecret: string, receiverSecret: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${senderSecret}|${receiverSecret}|${timestamp}`;
  const encoded = encodePayload(payload);
  return `KC-${encoded}`;
}

// Parse a confirmation code
export function parseConfirmationCode(code: string): { senderSecret: string; receiverSecret: string; timestamp: number } | null {
  try {
    if (!code.startsWith("KC-")) return null;
    const encoded = code.substring(3);
    const decoded = decodePayload(encoded);
    const parts = decoded.split("|");
    if (parts.length !== 3) return null;
    const senderSecret = parts[0];
    const receiverSecret = parts[1];
    const timestamp = parseInt(parts[2], 36);
    if (isNaN(timestamp)) return null;
    return { senderSecret, receiverSecret, timestamp };
  } catch {
    return null;
  }
}

export const [ReferralProvider, useReferral] = createContextHook(() => {
  const [mySecret, setMySecret] = useState<string>("");
  const [referralCount, setReferralCount] = useState(0);
  const [hasReferralPremium, setHasReferralPremium] = useState(false);
  const [referralPremiumExpiry, setReferralPremiumExpiry] = useState<number | null>(null);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize on mount
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
        AsyncStorage.removeItem(REFERRAL_PREMIUM_KEY);
        AsyncStorage.removeItem(REFERRAL_PREMIUM_EXPIRY_KEY);
      }
    };
    check();
    const interval = setInterval(check, 60000); // check every minute
    return () => clearInterval(interval);
  }, [referralPremiumExpiry]);

  const initializeReferral = async () => {
    try {
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
          // Expired
          await AsyncStorage.removeItem(REFERRAL_PREMIUM_KEY);
          await AsyncStorage.removeItem(REFERRAL_PREMIUM_EXPIRY_KEY);
        }
      }

      // Load used codes
      const usedStr = await AsyncStorage.getItem(REFERRAL_USED_CODES_KEY);
      if (usedStr) {
        setUsedCodes(JSON.parse(usedStr));
      }
    } catch (error) {
      console.error("Failed to initialize referral:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get my invite code to share with friends
  const getMyInviteCode = useCallback((): string => {
    if (!mySecret) return "";
    return generateInviteCode(mySecret);
  }, [mySecret]);

  // When Person B enters Person A's invite code
  // Returns a confirmation code to send back, or an error
  const redeemInviteCode = useCallback(async (code: string): Promise<{ confirmationCode: string } | { error: string }> => {
    const parsed = parseInviteCode(code);
    if (!parsed) {
      return { error: "Invalid referral code." };
    }

    // Check expiry
    if (Date.now() - parsed.timestamp > CODE_EXPIRY_MS) {
      return { error: "This referral code has expired (2-day limit)." };
    }

    // Check if it's own code
    if (parsed.senderSecret === mySecret) {
      return { error: "You can't use your own referral code." };
    }

    // Check if already used this sender's code
    if (usedCodes.includes(parsed.senderSecret)) {
      return { error: "You've already used a code from this person." };
    }

    // Mark as used
    const newUsed = [...usedCodes, parsed.senderSecret];
    setUsedCodes(newUsed);
    await AsyncStorage.setItem(REFERRAL_USED_CODES_KEY, JSON.stringify(newUsed));

    // Generate confirmation code for Person B to send back to Person A
    const confirmCode = generateConfirmationCode(parsed.senderSecret, mySecret);
    return { confirmationCode: confirmCode };
  }, [mySecret, usedCodes]);

  // When Person A enters the confirmation code from Person B
  const redeemConfirmationCode = useCallback(async (code: string): Promise<{ success: boolean; newCount: number } | { error: string }> => {
    const parsed = parseConfirmationCode(code);
    if (!parsed) {
      return { error: "Invalid confirmation code." };
    }

    // Check expiry
    if (Date.now() - parsed.timestamp > CODE_EXPIRY_MS) {
      return { error: "This confirmation code has expired (2-day limit)." };
    }

    // Verify the sender secret matches ours
    if (parsed.senderSecret !== mySecret) {
      return { error: "This confirmation code wasn't generated for you." };
    }

    // Check if we already counted this referrer
    if (usedCodes.includes(parsed.receiverSecret)) {
      return { error: "You've already counted this referral." };
    }

    // Mark receiver as counted
    const newUsed = [...usedCodes, parsed.receiverSecret];
    setUsedCodes(newUsed);
    await AsyncStorage.setItem(REFERRAL_USED_CODES_KEY, JSON.stringify(newUsed));

    // Increment referral count
    const newCount = referralCount + 1;
    setReferralCount(newCount);
    await AsyncStorage.setItem(REFERRAL_COUNT_KEY, newCount.toString());

    // Check if they earned premium
    await checkAndGrantPremium(newCount);

    return { success: true, newCount };
  }, [mySecret, usedCodes, referralCount]);

  const checkAndGrantPremium = async (count: number) => {
    let daysToGrant = 0;

    if (count >= 5) {
      daysToGrant = 30; // 1 month
    } else if (count >= 2) {
      daysToGrant = 7; // 1 week
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
    getMyInviteCode,
    redeemInviteCode,
    redeemConfirmationCode,
    getReferralPremiumDaysLeft,
  };
});
