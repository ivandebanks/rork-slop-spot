import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ActivityIndicator, Alert, ScrollView } from "react-native";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { Check, Crown, Shield, Zap, Star, RefreshCw, Minus, Building2, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";

export default function PaywallScreen() {
  const { scansRemaining, offerings, isLoadingOfferings, offeringsError, refetchOfferings, purchaseMutation, restoreMutation } = usePurchases();
  const { theme, scaleFont } = useTheme();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [monthlyPackage, setMonthlyPackage] = useState<any>(null);
  const [yearlyPackage, setYearlyPackage] = useState<any>(null);
  const starSpin = useRef(new Animated.Value(0)).current;

  // --- Staggered entrance animations ---
  const entranceSections = 9; // crown, title, urgency, subtitle, plans, socialProof, comparison, cta, restore
  const entranceProgress: ReturnType<typeof useSharedValue>[] = [];
  for (let i = 0; i < entranceSections; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    entranceProgress.push(useSharedValue(0));
  }

  const makeEntranceStyle = (index: number) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAnimatedStyle(() => ({
      opacity: entranceProgress[index].value,
      transform: [{ translateY: (1 - entranceProgress[index].value) * 24 }],
    }));
  };

  const entranceStyles = entranceProgress.map((_, i) => makeEntranceStyle(i));

  // Crown pulsing glow
  const crownScale = useSharedValue(1);
  const crownGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }],
  }));

  // CTA button shimmer/pulse
  const ctaOpacity = useSharedValue(1);
  const ctaPulseStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  // BEST VALUE badge pulse
  const bestValueScale = useSharedValue(1);
  const bestValueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bestValueScale.value }],
  }));

  useEffect(() => {
    // Trigger staggered entrances
    entranceProgress.forEach((val, i) => {
      val.value = withDelay(
        i * 100,
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
    });

    // Crown pulsing glow loop
    crownScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // CTA shimmer/pulse loop
    ctaOpacity.value = withRepeat(
      withSequence(
        withTiming(0.88, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // BEST VALUE badge gentle pulse
    bestValueScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(starSpin, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    if (offerings?.current) {
      const packages = offerings.current.availablePackages;
      const monthly = packages.find((p: any) =>
        p.product?.identifier === "kiwi_monthly_v2" || p.packageType === "MONTHLY"
      );
      const yearly = packages.find((p: any) =>
        p.product?.identifier === "kiwi_yearly_v2" || p.packageType === "ANNUAL"
      );
      setMonthlyPackage(monthly || null);
      setYearlyPackage(yearly || null);
      // Default to yearly (best value)
      setSelectedPackage(yearly || monthly || packages[0]);
    }
  }, [offerings]);

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
      Alert.alert("Success!", "Welcome to Premium! Enjoy unlimited scans.", [
        { text: "OK", onPress: () => router.back() }
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
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert("Restore Failed", "No purchases found to restore.");
    }
  };

  const spinInterpolation = starSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const isDark = theme.background === "#121212";

  if (isLoadingOfferings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
            Loading offers...
          </Text>
        </View>
      </View>
    );
  }

  if (!offerings?.current || !selectedPackage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header} />
        <View style={styles.centerContent}>
          <Crown size={48} color={theme.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.text, fontSize: scaleFont(20) }]}>
            Offers Unavailable
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
            {offeringsError?.message || "Unable to load premium offers. Please check your connection and try again."}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => refetchOfferings()}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={[styles.retryButtonText, { fontSize: scaleFont(16) }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header} />

      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          {/* Crown with pulsing glow - entrance 0 */}
          <ReAnimated.View style={[entranceStyles[0], crownGlowStyle]}>
            <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
              <Crown size={48} color="#D4AF37" fill="#D4AF37" />
            </Animated.View>
          </ReAnimated.View>

          {/* Title - entrance 1 */}
          <ReAnimated.View style={entranceStyles[1]}>
            <Text style={[styles.title, { color: theme.text, fontSize: scaleFont(30) }]}>
              Know What You're Really Eating
            </Text>
          </ReAnimated.View>

          {/* Urgency badge - entrance 2 */}
          <ReAnimated.View style={entranceStyles[2]}>
            <View style={styles.urgencyBadge}>
              <Text style={[styles.urgencyBadgeText, { fontSize: scaleFont(12) }]}>
                LIMITED: First week free, then {selectedPackage?.product?.priceString}
              </Text>
            </View>
          </ReAnimated.View>

          {/* Subtitle - entrance 3 */}
          <ReAnimated.View style={entranceStyles[3]}>
            <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
              Scan any label. Get the truth about every ingredient.
            </Text>
            <Text style={[styles.scansInfo, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
              Currently: {scansRemaining}
            </Text>
          </ReAnimated.View>
        </View>

        {/* Plan Selector - entrance 4 */}
        {(monthlyPackage || yearlyPackage) && (
          <ReAnimated.View style={[styles.planSelector, entranceStyles[4]]}>
            {yearlyPackage && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.planOption,
                  {
                    borderColor: selectedPackage === yearlyPackage ? "#D4AF37" : (isDark ? "#2A2720" : "#E0D8C0"),
                    borderWidth: selectedPackage === yearlyPackage ? 2.5 : 1.5,
                  },
                ]}
                onPress={() => {
                  setSelectedPackage(yearlyPackage);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <BlurView
                  intensity={isDark ? 40 : 25}
                  tint={isDark ? "dark" : "light"}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(28,26,20,0.65)" : "rgba(255,253,245,0.7)" }]} />
                <ReAnimated.View style={[styles.planBestValue, bestValueStyle]}>
                  <Text style={styles.planBestValueText}>BEST VALUE</Text>
                </ReAnimated.View>
                <View style={styles.planRadio}>
                  <View style={[
                    styles.planRadioOuter,
                    { borderColor: selectedPackage === yearlyPackage ? "#D4AF37" : (isDark ? "#444" : "#CCC") }
                  ]}>
                    {selectedPackage === yearlyPackage && <View style={styles.planRadioInner} />}
                  </View>
                </View>
                <View style={styles.planDetails}>
                  <Text style={[styles.planTitle, { color: theme.text, fontSize: scaleFont(16) }]}>Yearly</Text>
                  <Text style={[styles.planPrice, { color: theme.text, fontSize: scaleFont(14) }]}>
                    {yearlyPackage.product.priceString}/year
                  </Text>
                  <Text style={[styles.planSavings, { color: "#D4AF37", fontSize: scaleFont(12) }]}>
                    Save 33% vs monthly
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {monthlyPackage && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.planOption,
                  {
                    borderColor: selectedPackage === monthlyPackage ? "#D4AF37" : (isDark ? "#2A2720" : "#E0D8C0"),
                    borderWidth: selectedPackage === monthlyPackage ? 2.5 : 1.5,
                  },
                ]}
                onPress={() => {
                  setSelectedPackage(monthlyPackage);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <BlurView
                  intensity={isDark ? 40 : 25}
                  tint={isDark ? "dark" : "light"}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(28,26,20,0.65)" : "rgba(255,253,245,0.7)" }]} />
                <View style={styles.planRadio}>
                  <View style={[
                    styles.planRadioOuter,
                    { borderColor: selectedPackage === monthlyPackage ? "#D4AF37" : (isDark ? "#444" : "#CCC") }
                  ]}>
                    {selectedPackage === monthlyPackage && <View style={styles.planRadioInner} />}
                  </View>
                </View>
                <View style={styles.planDetails}>
                  <Text style={[styles.planTitle, { color: theme.text, fontSize: scaleFont(16) }]}>Monthly</Text>
                  <Text style={[styles.planPrice, { color: theme.text, fontSize: scaleFont(14) }]}>
                    {monthlyPackage.product.priceString}/month
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </ReAnimated.View>
        )}

        {/* Social proof - entrance 5 */}
        <ReAnimated.View style={[styles.socialProof, entranceStyles[5]]}>
          <Text style={[styles.socialProofText, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Trusted by 25,000+ health-conscious families
          </Text>
        </ReAnimated.View>

        {/* Comparison card - entrance 6, with soft shadows */}
        <ReAnimated.View style={[styles.cardWrapper, entranceStyles[6]]}>
          <View style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1C1A14" : "#FFFDF5",
              borderColor: "#D4AF37",
              shadowColor: "#D4AF37",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.35 : 0.18,
              shadowRadius: 16,
              elevation: 10,
            }
          ]}>
            <View style={styles.cardBadge}>
              <View style={styles.badgeInner}>
                <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.badgeText}>PREMIUM</Text>
                <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </View>

            <View style={styles.cardContent}>
              {/* Comparison Table */}
              <View style={styles.comparisonTable}>
                {/* Header row */}
                <View style={styles.comparisonHeaderRow}>
                  <View style={styles.comparisonFeatureCol} />
                  <View style={styles.comparisonCol}>
                    <Text style={[styles.comparisonColHeader, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>Free</Text>
                  </View>
                  <View style={[styles.comparisonCol, styles.comparisonPremiumCol]}>
                    <Text style={[styles.comparisonColHeaderPremium, { fontSize: scaleFont(12) }]}>Premium</Text>
                  </View>
                </View>

                {[
                  { feature: "Daily Scans", free: "2 per day", premium: "Unlimited", icon: <Zap size={14} color={theme.textSecondary} /> },
                  { feature: "Ingredient Ratings", free: true, premium: true, icon: <Shield size={14} color={theme.textSecondary} /> },
                  { feature: "Scientific Citations", free: true, premium: true, icon: <Star size={14} color={theme.textSecondary} /> },
                  { feature: "Behind It", free: false, premium: true, icon: <Building2 size={14} color={theme.textSecondary} /> },
                  { feature: "Healthier Alternatives", free: false, premium: true, icon: <Sparkles size={14} color={theme.textSecondary} /> },
                  { feature: "Priority Analysis", free: false, premium: true, icon: <Zap size={14} color={theme.textSecondary} /> },
                ].map((row, i) => (
                  <View key={i} style={[styles.comparisonRow, { borderTopColor: isDark ? "#2A2720" : "#F0E8D0" }]}>
                    <View style={styles.comparisonFeatureCol}>
                      <View style={styles.featureIconRow}>
                        {row.icon}
                        <Text style={[styles.comparisonFeature, { color: theme.text, fontSize: scaleFont(13) }]} numberOfLines={1}>
                          {row.feature}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.comparisonCol}>
                      {typeof row.free === "string" ? (
                        <Text style={[styles.comparisonValue, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>{row.free}</Text>
                      ) : row.free ? (
                        <Check size={16} color="#06D6A0" strokeWidth={3} />
                      ) : (
                        <Minus size={16} color={theme.textSecondary} />
                      )}
                    </View>
                    <View style={[styles.comparisonCol, styles.comparisonPremiumCol]}>
                      {typeof row.premium === "string" ? (
                        <Text style={[styles.comparisonValuePremium, { fontSize: scaleFont(11) }]}>{row.premium}</Text>
                      ) : row.premium ? (
                        <Check size={16} color="#D4AF37" strokeWidth={3} />
                      ) : (
                        <Minus size={16} color={theme.textSecondary} />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ReAnimated.View>

        {/* CTA button - entrance 7 with shimmer pulse */}
        <ReAnimated.View style={[entranceStyles[7], ctaPulseStyle, { width: "100%", maxWidth: 360 }]}>
          <TouchableOpacity
            style={[styles.buyButton, { opacity: purchaseMutation.isPending ? 0.7 : 1 }]}
            onPress={handlePurchase}
            disabled={purchaseMutation.isPending}
            activeOpacity={0.85}
          >
            {purchaseMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={[styles.buyButtonText, { fontSize: scaleFont(18) }]}>
                  Start 3-Day Free Trial
                </Text>
                <Crown size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </ReAnimated.View>

        {/* Restore - entrance 8 */}
        <ReAnimated.View style={entranceStyles[8]}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={restoreMutation.isPending}
          >
            {restoreMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.textSecondary} />
            ) : (
              <>
                <RefreshCw size={14} color={theme.textSecondary} />
                <Text style={[styles.restoreText, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
                  Restore Purchases
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ReAnimated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
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
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    textAlign: "center",
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  mainContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginTop: -20,
  },
  topSection: {
    alignItems: "center",
    gap: 6,
    marginBottom: 32,
  },
  title: {
    fontWeight: "800" as const,
    textAlign: "center",
    marginTop: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: "center",
    letterSpacing: 0.2,
  },
  scansInfo: {
    textAlign: "center",
    marginTop: 2,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 360,
  },
  cardTouchable: {
    width: "100%",
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    paddingTop: 32,
    paddingBottom: 0,
    overflow: "hidden",
    position: "relative",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 120,
    borderRadius: 24,
  },
  shimmerOverlay2: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "50%",
    height: "100%",
    borderRadius: 24,
  },
  glowRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    borderWidth: 3,
  },
  cardBadge: {
    alignItems: "center",
    marginBottom: 20,
  },
  badgeInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800" as const,
    letterSpacing: 1.5,
  },
  cardContent: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  currency: {
    fontWeight: "700" as const,
    marginTop: 8,
    marginRight: 2,
  },
  priceMain: {
    fontWeight: "900" as const,
    lineHeight: 62,
  },
  priceDecimal: {
    fontWeight: "700" as const,
    marginTop: 8,
  },
  oneTime: {
    marginTop: 2,
    letterSpacing: 0.3,
  },
  divider: {
    width: "80%",
    height: 1,
    marginVertical: 20,
  },
  perks: {
    width: "100%",
    gap: 14,
    marginBottom: 24,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
  },
  perkText: {
    fontWeight: "500" as const,
    flex: 1,
  },
  buyButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 22,
    marginTop: 20,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800" as const,
    letterSpacing: 0.5,
  },
  sparkleCornerTL: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  sparkleCornerTR: {
    position: "absolute",
    top: 14,
    right: 12,
  },
  sparkleCornerBL: {
    position: "absolute",
    bottom: 70,
    left: 14,
  },
  sparkleCornerBR: {
    position: "absolute",
    bottom: 72,
    right: 12,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 18,
    marginTop: 20,
  },
  restoreButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  restoreText: {
    letterSpacing: 0.3,
  },
  urgencyBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  urgencyBadgeText: {
    color: "#D4AF37",
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },
  socialProof: {
    marginBottom: 16,
    alignItems: "center" as const,
  },
  socialProofText: {
    fontStyle: "italic" as const,
    textAlign: "center" as const,
  },
  // Plan selector
  planSelector: {
    width: "100%",
    maxWidth: 360,
    gap: 10,
    marginBottom: 20,
  },
  planOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  planBestValue: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  planBestValueText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.8,
  },
  planRadio: {
    marginRight: 14,
  },
  planRadioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D4AF37",
  },
  planDetails: {
    flex: 1,
  },
  planTitle: {
    fontWeight: "700" as const,
  },
  planPrice: {
    fontWeight: "500" as const,
    marginTop: 2,
  },
  planSavings: {
    fontWeight: "600" as const,
    marginTop: 2,
  },
  // Comparison table
  comparisonTable: {
    width: "100%",
    marginBottom: 4,
  },
  comparisonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 2,
  },
  comparisonFeatureCol: {
    flex: 1,
  },
  comparisonCol: {
    width: 64,
    alignItems: "center",
  },
  comparisonPremiumCol: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderRadius: 8,
    paddingVertical: 2,
  },
  comparisonColHeader: {
    fontWeight: "600" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  comparisonColHeaderPremium: {
    fontWeight: "700" as const,
    color: "#D4AF37",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  featureIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  comparisonFeature: {
    fontWeight: "500" as const,
    flex: 1,
  },
  comparisonValue: {
    fontWeight: "500" as const,
    textAlign: "center",
  },
  comparisonValuePremium: {
    fontWeight: "700" as const,
    color: "#D4AF37",
    textAlign: "center",
  },
});
