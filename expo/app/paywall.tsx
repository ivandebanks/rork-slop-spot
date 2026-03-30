import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
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
import { Check, Star, RefreshCw } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
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
  // CTA shimmer/pulse animation
  const ctaOpacity = useSharedValue(1);
  const ctaPulseStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  useEffect(() => {
    ctaOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const weeklyPackage = useMemo(() => {
    if (!offerings?.current) return null;
    const packages = offerings.current.availablePackages;
    return (
      packages.find((p: any) => p.product?.identifier === "kiwi_weekly_v1" || p.packageType === "WEEKLY") ||
      null
    );
  }, [offerings]);

  const annualPackage = useMemo(() => {
    if (!offerings?.current) return null;
    const packages = offerings.current.availablePackages;
    return (
      packages.find((p: any) => p.product?.identifier === "kiwi_annual_v1" || p.packageType === "ANNUAL") ||
      null
    );
  }, [offerings]);

  // Fall back to monthly if weekly/annual not yet configured in RevenueCat
  const monthlyPackage = useMemo(() => {
    if (!offerings?.current) return null;
    const packages = offerings.current.availablePackages;
    return (
      packages.find((p: any) => p.product?.identifier === "kiwi_monthly_v2" || p.packageType === "MONTHLY") ||
      null
    );
  }, [offerings]);

  type PlanType = "weekly" | "annual";
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("weekly");

  const selectedPackage = useMemo(() => {
    if (selectedPlan === "weekly" && weeklyPackage) return weeklyPackage;
    if (selectedPlan === "annual" && annualPackage) return annualPackage;
    // Fallback: if selected plan isn't available, try the other, then monthly
    return weeklyPackage || annualPackage || monthlyPackage;
  }, [selectedPlan, weeklyPackage, annualPackage, monthlyPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await purchaseMutation.mutateAsync(selectedPackage);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Toast.show({ type: "success", text1: "Welcome to Premium!", text2: "Enjoy unlimited scans." });
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.message !== "Purchase cancelled") {
        Toast.show({ type: "error", text1: "Purchase Failed", text2: error.message || "Please try again later." });
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
      Toast.show({ type: "success", text1: "Purchases Restored", text2: "Your purchases have been restored." });
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Restore Failed", text2: "No purchases found to restore." });
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

  // --- Error state (only if RevenueCat completely fails) ---
  if (!offerings?.current && offeringsError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <RefreshCw size={48} color={GRAY} />
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
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20, paddingTop: 20 }]}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Plan picker */}
        <View style={styles.planPicker}>
          {/* Annual option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPlan("annual")}
            style={[
              styles.planOption,
              selectedPlan === "annual" && styles.planOptionSelected,
            ]}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>SAVE 60%</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={[styles.planRadio, selectedPlan === "annual" && styles.planRadioSelected]}>
                {selectedPlan === "annual" && <View style={styles.planRadioDot} />}
              </View>
              <View style={styles.planDetails}>
                <Text style={[styles.planName, selectedPlan === "annual" && styles.planNameSelected]}>Annual</Text>
                <Text style={styles.planPerWeek}>$0.96/week</Text>
              </View>
              <View style={styles.planPriceContainer}>
                <Text style={[styles.planPrice, selectedPlan === "annual" && styles.planPriceSelected]}>$49.99</Text>
                <Text style={styles.planPricePeriod}>/year</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Weekly option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPlan("weekly")}
            style={[
              styles.planOption,
              selectedPlan === "weekly" && styles.planOptionSelected,
            ]}
          >
            <View style={styles.planHeader}>
              <View style={[styles.planRadio, selectedPlan === "weekly" && styles.planRadioSelected]}>
                {selectedPlan === "weekly" && <View style={styles.planRadioDot} />}
              </View>
              <View style={styles.planDetails}>
                <Text style={[styles.planName, selectedPlan === "weekly" && styles.planNameSelected]}>Weekly</Text>
                <Text style={styles.planPerWeek}>Cancel anytime</Text>
              </View>
              <View style={styles.planPriceContainer}>
                <Text style={[styles.planPrice, selectedPlan === "weekly" && styles.planPriceSelected]}>$2.99</Text>
                <Text style={styles.planPricePeriod}>/week</Text>
              </View>
            </View>
          </TouchableOpacity>
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
                <Text style={styles.ctaText}>Start Scanning Now</Text>
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

  // Scroll content
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
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

  // Plan picker
  planPicker: {
    width: "100%",
    gap: 10,
    marginBottom: 24,
  },
  planOption: {
    borderWidth: 2,
    borderColor: GRAY_DARK,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: "relative",
    overflow: "visible",
  },
  planOptionSelected: {
    borderColor: GOLD,
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  planBadge: {
    position: "absolute",
    top: -11,
    right: 14,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: GRAY_DARK,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planRadioSelected: {
    borderColor: GOLD,
  },
  planRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GOLD,
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planNameSelected: {
    color: "#FFFFFF",
  },
  planPerWeek: {
    fontSize: 12,
    color: GRAY,
    marginTop: 1,
  },
  planPriceContainer: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  planPriceSelected: {
    color: GOLD,
  },
  planPricePeriod: {
    fontSize: 12,
    color: GRAY,
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
