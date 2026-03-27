import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert, ScrollView } from "react-native";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { usePurchases } from "@/contexts/PurchaseContext";
import { router } from "expo-router";
import { Check, Crown, Star, RefreshCw, Clock, X, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { markRecoveryShown, resetAbandonState } from "@/utils/abandonRecovery";

const GOLD = "#D4AF37";
const GOLD_DARK = "#B8860B";
const GOLD_LIGHT = "#F5DEB3";
const BG = "#0a0a0f";
const GRAY = "#94a3b8";
const GRAY_DARK = "#475569";

const ORIGINAL_PRICE = "$4.99";
const RECOVERY_PRICE = "$1.49";
const DISCOUNT_PERCENT = 70;

// Countdown duration: 15 minutes in seconds
const COUNTDOWN_DURATION = 15 * 60;

const BENEFITS = [
  "Unlimited ingredient scans",
  "Instant safety ratings",
  "Healthier product swaps",
  "Science-backed analysis",
  "Priority processing",
];

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function RecoveryPaywallScreen() {
  const { offerings, isLoadingOfferings, offeringsError, refetchOfferings, purchaseMutation, restoreMutation } = usePurchases();
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animations
  const crownScale = useSharedValue(1);
  const crownRotate = useSharedValue(0);
  const ctaOpacity = useSharedValue(1);
  const badgeScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  const crownPulseStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: crownScale.value },
      { rotate: `${crownRotate.value}deg` },
    ],
  }));

  const ctaPulseStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  useEffect(() => {
    markRecoveryShown();

    // Crown entrance + pulse
    crownScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 }),
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Subtle crown rotation
    crownRotate.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // CTA pulse
    ctaOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Discount badge pop-in
    badgeScale.value = withDelay(
      300,
      withSequence(
        withTiming(1.3, { duration: 300, easing: Easing.out(Easing.back(3)) }),
        withTiming(1, { duration: 200 })
      )
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const monthlyPackage = useMemo(() => {
    if (!offerings?.current) return null;
    const packages = offerings.current.availablePackages;
    // Look for a promotional/recovery package first, fall back to monthly
    return (
      packages.find((p: any) => p.product?.identifier === "kiwi_recovery_monthly") ||
      packages.find((p: any) => p.product?.identifier === "kiwi_monthly_v2" || p.packageType === "MONTHLY") ||
      packages[0] ||
      null
    );
  }, [offerings]);

  const handlePurchase = useCallback(async () => {
    if (!monthlyPackage) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    try {
      await purchaseMutation.mutateAsync(monthlyPackage);
      await resetAbandonState();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Welcome Back!", "Your premium access is now active. Enjoy unlimited scans!", [
        { text: "Start Scanning", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      if (error.message !== "Purchase cancelled") {
        Alert.alert("Purchase Failed", error.message || "Please try again later.");
      }
    }
  }, [monthlyPackage, purchaseMutation]);

  const handleRestore = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await restoreMutation.mutateAsync();
      await resetAbandonState();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success!", "Your purchases have been restored.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      Alert.alert("Restore Failed", "No purchases found to restore.");
    }
  }, [restoreMutation]);

  const handleDismiss = useCallback(() => {
    router.back();
  }, []);

  // --- Loading state ---
  if (isLoadingOfferings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Preparing your special offer...</Text>
        </View>
      </View>
    );
  }

  // --- Error state ---
  if (!offerings?.current || !monthlyPackage) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <Crown size={48} color={GRAY} />
          <Text style={styles.errorTitle}>Offer Unavailable</Text>
          <Text style={styles.errorText}>
            {offeringsError?.message || "Unable to load your special offer. Please check your connection and try again."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchOfferings()}>
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Close button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <X size={20} color={GRAY} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} disabled={restoreMutation.isPending} style={styles.headerRestore}>
          {restoreMutation.isPending ? (
            <ActivityIndicator size="small" color={GRAY} />
          ) : (
            <Text style={styles.headerRestoreText}>Restore</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Glow effect behind crown */}
        <ReAnimated.View style={[styles.glowContainer, glowStyle]}>
          <View style={styles.glow} />
        </ReAnimated.View>

        {/* Crown icon with discount badge */}
        <View style={styles.crownWrapper}>
          <ReAnimated.View style={[styles.crownContainer, crownPulseStyle]}>
            <LinearGradient colors={[GOLD, GOLD_DARK]} style={styles.crownCircle}>
              <Crown size={32} color="#FFFFFF" fill="#FFFFFF" />
            </LinearGradient>
          </ReAnimated.View>
          <ReAnimated.View style={[styles.discountBadge, badgeAnimStyle]}>
            <Text style={styles.discountBadgeText}>{DISCOUNT_PERCENT}% OFF</Text>
          </ReAnimated.View>
        </View>

        {/* Headline */}
        <ReAnimated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.headline}>We Kept Your Premium{"\n"}Access Ready</Text>
        </ReAnimated.View>

        {/* Subheadline */}
        <ReAnimated.View entering={FadeInDown.delay(350).duration(500)}>
          <Text style={styles.subheadline}>
            Come back to a special offer just for you — unlock everything at a fraction of the cost.
          </Text>
        </ReAnimated.View>

        {/* Urgency: Countdown timer */}
        {countdown > 0 && (
          <ReAnimated.View entering={FadeInDown.delay(450).duration(500)} style={styles.countdownContainer}>
            <Clock size={16} color={GOLD} />
            <Text style={styles.countdownLabel}>Offer expires in</Text>
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownText}>{formatCountdown(countdown)}</Text>
            </View>
          </ReAnimated.View>
        )}

        {/* Trust badge */}
        <ReAnimated.View entering={FadeInDown.delay(500).duration(500)} style={styles.trustBadge}>
          <Star size={14} color={GOLD} fill={GOLD} />
          <Text style={styles.trustBadgeText}>Trusted by 25,000+ health-conscious families</Text>
        </ReAnimated.View>

        {/* Benefits */}
        <ReAnimated.View entering={FadeInDown.delay(600).duration(500)} style={styles.benefitsSection}>
          {BENEFITS.map((benefit, i) => (
            <ReAnimated.View
              key={i}
              entering={FadeInUp.delay(650 + i * 80).duration(400)}
              style={styles.benefitRow}
            >
              <View style={styles.benefitCheckCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </ReAnimated.View>
          ))}
        </ReAnimated.View>

        {/* Price section with strikethrough */}
        <ReAnimated.View entering={FadeInDown.delay(900).duration(500)} style={styles.priceSection}>
          <View style={styles.priceCompare}>
            <Text style={styles.originalPrice}>{ORIGINAL_PRICE}</Text>
            <Zap size={16} color={GOLD} fill={GOLD} />
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>{RECOVERY_PRICE}</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <Text style={styles.priceSubtext}>Limited-time recovery offer — save {DISCOUNT_PERCENT}% today</Text>
        </ReAnimated.View>

        {/* CTA */}
        <ReAnimated.View entering={FadeInDown.delay(1000).duration(500)} style={[styles.ctaWrapper, ctaPulseStyle]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePurchase}
            disabled={purchaseMutation.isPending || countdown === 0}
            style={{ borderRadius: 16, overflow: "hidden" }}
          >
            <LinearGradient
              colors={countdown === 0 ? [GRAY_DARK, GRAY_DARK] : [GOLD, GOLD_DARK]}
              style={[styles.ctaButton, purchaseMutation.isPending && { opacity: 0.7 }]}
            >
              {purchaseMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaText}>
                    {countdown === 0 ? "Offer Expired" : "Claim Your 70% Discount"}
                  </Text>
                  {countdown > 0 && <Crown size={20} color="#FFFFFF" />}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ReAnimated.View>

        {/* Restore link */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoreMutation.isPending}>
          {restoreMutation.isPending ? (
            <ActivityIndicator size="small" color={GRAY} />
          ) : (
            <>
              <RefreshCw size={13} color={GRAY} />
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legalText}>
          Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically
          renews unless canceled at least 24 hours before the end of the current period. Your account will be charged
          for renewal within 24 hours prior to the end of the current period. You can manage and cancel your
          subscriptions by going to your account settings in the App Store.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: GRAY,
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: GRAY,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: GOLD,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRestore: {
    padding: 4,
  },
  headerRestoreText: {
    fontSize: 13,
    color: GRAY,
    fontWeight: "400",
  },

  // Scroll content
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },

  // Glow
  glowContainer: {
    position: "absolute",
    top: 0,
    alignItems: "center",
    width: "100%",
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: GOLD,
    opacity: 0.15,
  },

  // Crown
  crownWrapper: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  crownContainer: {},
  crownCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    position: "absolute",
    top: -4,
    right: -28,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    transform: [{ rotate: "12deg" }],
  },
  discountBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  // Headline
  headline: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  // Subheadline
  subheadline: {
    fontSize: 15,
    color: GRAY,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 21,
    paddingHorizontal: 8,
  },

  // Countdown
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  countdownLabel: {
    fontSize: 13,
    color: GOLD_LIGHT,
    fontWeight: "500",
  },
  countdownBadge: {
    backgroundColor: "rgba(212,175,55,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: "800",
    color: GOLD,
    fontVariant: ["tabular-nums"],
  },

  // Trust badge
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212,175,55,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  trustBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: GOLD,
  },

  // Benefits
  benefitsSection: {
    width: "100%",
    gap: 14,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFFFFF",
    flex: 1,
  },

  // Price
  priceSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  priceCompare: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 18,
    color: GRAY_DARK,
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: GOLD,
  },
  pricePeriod: {
    fontSize: 16,
    color: GRAY,
    marginLeft: 2,
  },
  priceSubtext: {
    fontSize: 13,
    color: GOLD_LIGHT,
    fontWeight: "500",
    marginTop: 4,
  },

  // CTA
  ctaWrapper: {
    width: "100%",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 12,
  },
  ctaButton: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  // Restore
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    marginTop: 4,
  },
  restoreText: {
    fontSize: 13,
    color: GRAY,
  },

  // Legal
  legalText: {
    fontSize: 11,
    color: GRAY_DARK,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 16,
    paddingHorizontal: 8,
  },
});
