import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert, ScrollView } from "react-native";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { usePurchases } from "@/contexts/PurchaseContext";
import { router } from "expo-router";
import { Check, Crown, Star, RefreshCw } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GOLD = "#D4AF37";
const GOLD_DARK = "#B8860B";
const BG = "#0a0a0f";
const GRAY = "#94a3b8";
const GRAY_DARK = "#475569";

const BENEFITS = [
  "Scan as many labels as you want",
  "Instantly spot questionable ingredients",
  "See science-backed safety ratings",
  "Learn who's really behind the product",
  "Find healthier swaps in seconds",
  "Get priority analysis when it matters",
];

export default function PaywallScreen() {
  const { offerings, isLoadingOfferings, offeringsError, refetchOfferings, purchaseMutation, restoreMutation } = usePurchases();
  const insets = useSafeAreaInsets();

  // Crown pulse animation
  const crownScale = useSharedValue(1);
  const crownPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }],
  }));

  // CTA shimmer/pulse animation
  const ctaOpacity = useSharedValue(1);
  const ctaPulseStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  useEffect(() => {
    crownScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    ctaOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const monthlyPackage = useMemo(() => {
    if (!offerings?.current) return null;
    const packages = offerings.current.availablePackages;
    return (
      packages.find((p: any) => p.product?.identifier === "kiwi_monthly_v2" || p.packageType === "MONTHLY") ||
      packages[0] ||
      null
    );
  }, [offerings]);

  const handlePurchase = async () => {
    if (!monthlyPackage) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await purchaseMutation.mutateAsync(monthlyPackage);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success!", "Welcome to Premium! Enjoy unlimited scans.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      if (error.message !== "Purchase cancelled") {
        Alert.alert("Purchase Failed", error.message || "Please try again later.");
      }
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await restoreMutation.mutateAsync();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success!", "Your purchases have been restored.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      Alert.alert("Restore Failed", "No purchases found to restore.");
    }
  };

  // --- Loading state ---
  if (isLoadingOfferings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Loading offers...</Text>
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
          <Text style={styles.errorTitle}>Offers Unavailable</Text>
          <Text style={styles.errorText}>
            {offeringsError?.message || "Unable to load premium offers. Please check your connection and try again."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchOfferings()}>
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Main paywall ---
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header — restore only */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleRestore} disabled={restoreMutation.isPending} style={styles.headerRestore}>
          {restoreMutation.isPending ? (
            <ActivityIndicator size="small" color={GRAY} />
          ) : (
            <Text style={styles.headerRestoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Crown icon */}
        <ReAnimated.View style={[styles.crownContainer, crownPulseStyle]}>
          <LinearGradient colors={[GOLD, GOLD_DARK]} style={styles.crownCircle}>
            <Crown size={28} color="#FFFFFF" fill="#FFFFFF" />
          </LinearGradient>
        </ReAnimated.View>

        {/* Headline */}
        <Text style={styles.headline}>Know What You're Really Eating</Text>

        {/* Subheadline */}
        <Text style={styles.subheadline}>
          Understand every ingredient in seconds — before you buy.
        </Text>

        {/* Trust badge */}
        <View style={styles.trustBadge}>
          <Star size={14} color={GOLD} fill={GOLD} />
          <Text style={styles.trustBadgeText}>Trusted by 25,000+ health-conscious families</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          {BENEFITS.map((benefit, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitCheckCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Price framing */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <Text style={styles.priceSubtext}>Less than the cost of one bad grocery decision</Text>
        </View>

        {/* CTA */}
        <ReAnimated.View style={[styles.ctaWrapper, ctaPulseStyle]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePurchase}
            disabled={purchaseMutation.isPending}
            style={{ borderRadius: 16, overflow: "hidden" }}
          >
            <LinearGradient colors={[GOLD, GOLD_DARK]} style={[styles.ctaButton, purchaseMutation.isPending && { opacity: 0.7 }]}>
              {purchaseMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaText}>Get Instant Access</Text>
                  <Crown size={20} color="#FFFFFF" />
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
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 10,
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

  // Crown
  crownContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  crownCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
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
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  pricePeriod: {
    fontSize: 16,
    color: GRAY,
    marginLeft: 2,
  },
  priceSubtext: {
    fontSize: 13,
    color: GRAY,
    fontStyle: "italic",
    marginTop: 4,
  },

  // CTA
  ctaWrapper: {
    width: "100%",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
