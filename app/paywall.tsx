import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ActivityIndicator, Alert } from "react-native";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { X, Check, Crown, Shield, Zap, Star, RefreshCw, Minus, Building2, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";

export default function PaywallScreen() {
  const { scansRemaining, offerings, isLoadingOfferings, purchaseMutation, restoreMutation } = usePurchases();
  const { theme, scaleFont } = useTheme();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const starSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(starSpin, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    if (offerings?.current) {
      const pkg = offerings.current.availablePackages[0];
      setSelectedPackage(pkg);
    }
  }, [offerings]);

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

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
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Crown size={48} color={theme.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.text, fontSize: scaleFont(20) }]}>
            Offers Unavailable
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
            Unable to load premium offers. Please check your connection and try again.
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={handleClose}
          >
            <Text style={[styles.retryButtonText, { fontSize: scaleFont(16) }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const priceString = selectedPackage.product.priceString;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.topSection}>
          <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
            <Crown size={48} color="#D4AF37" fill="#D4AF37" />
          </Animated.View>
          <Text style={[styles.title, { color: theme.text, fontSize: scaleFont(30) }]}>
            Premium Features
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
            Unlimited scanning power
          </Text>
          <Text style={[styles.scansInfo, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Currently: {scansRemaining}
          </Text>
        </View>

        <View style={styles.cardWrapper}>
          <View style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1C1A14" : "#FFFDF5",
              borderColor: "#D4AF37",
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
        </View>

        <TouchableOpacity 
          style={[styles.buyButton, { opacity: purchaseMutation.isPending ? 0.7 : 1 }]}
          onPress={handlePurchase}
          disabled={purchaseMutation.isPending}
        >
          {purchaseMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={[styles.buyButtonText, { fontSize: scaleFont(18) }]}>
                Get Premium for {priceString}
              </Text>
              <Crown size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

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
      </View>
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
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
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
    flex: 1,
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
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
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
