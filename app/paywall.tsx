import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Animated } from "react-native";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { X, Check, Sparkles, AlertCircle, RefreshCw, Crown, Shield, Zap, Star } from "lucide-react-native";
import { PurchasesPackage } from "react-native-purchases";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function PaywallScreen() {
  const { offerings, purchaseMutation, scansRemaining, isLoading, error } = usePurchases();
  const { theme, scaleFont } = useTheme();
  const queryClient = useQueryClient();

  const shimmer1 = useRef(new Animated.Value(0)).current;
  const shimmer2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const starSpin = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer1, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shimmer1, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer2, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(shimmer2, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(starSpin, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    console.log("=== PAYWALL DEBUG ===");
    console.log("Offerings:", offerings);
    console.log("Is Loading:", isLoading);
    console.log("Error:", error);
    if (offerings?.current) {
      console.log("Available packages:", offerings.current.availablePackages.length);
      offerings.current.availablePackages.forEach((pkg, index) => {
        console.log(`\nPackage ${index + 1}:`, {
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          title: pkg.product.title,
          price: pkg.product.priceString,
          priceAmount: pkg.product.price,
          currencyCode: pkg.product.currencyCode,
        });
      });
    }
    console.log("=== END DEBUG ===\n");
  }, [offerings, isLoading, error]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    try {
      await purchaseMutation.mutateAsync(pkg);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
        alert(`Purchase failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const spinInterpolation = starSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const shimmerOpacity1 = shimmer1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.6, 0.2],
  });

  const shimmerOpacity2 = shimmer2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.4, 0.1],
  });

  const shimmerTranslate = shimmer1.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  if (isLoading || !offerings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={[styles.loadingText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !offerings.current) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <AlertCircle size={48} color={theme.error || "#FF3B30"} />
          <Text style={[styles.errorTitle, { color: theme.text, fontSize: scaleFont(20) }]}>
            Unable to Load
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
            {error?.message || "Please check your internet connection and try again."}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: "#D4AF37" }]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              queryClient.invalidateQueries({ queryKey: ["offerings"] });
              queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
            }}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={[styles.retryButtonText, { fontSize: scaleFont(16) }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const packages = offerings.current.availablePackages;
  const targetPackage = packages.length > 0 ? packages[0] : null;

  if (!targetPackage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <AlertCircle size={48} color={theme.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.text, fontSize: scaleFont(20) }]}>
            No Plans Available
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
            Please try again later or contact support.
          </Text>
        </View>
      </View>
    );
  }

  const isDark = theme.background === "#121212";

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
            Go Premium
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
            One purchase. Unlimited power. Forever.
          </Text>
          <Text style={[styles.scansInfo, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Currently: {scansRemaining}
          </Text>
        </View>

        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handlePurchase(targetPackage)}
            disabled={purchaseMutation.isPending}
            style={styles.cardTouchable}
          >
            <View style={[
              styles.card,
              {
                backgroundColor: isDark ? "#1C1A14" : "#FFFDF5",
                borderColor: "#D4AF37",
              }
            ]}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    opacity: shimmerOpacity1,
                    transform: [{ translateX: shimmerTranslate }],
                    backgroundColor: "#D4AF37",
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.shimmerOverlay2,
                  {
                    opacity: shimmerOpacity2,
                    backgroundColor: "#FFD700",
                  },
                ]}
              />

              <Animated.View style={[styles.glowRing, { opacity: glowOpacity, borderColor: "#D4AF37" }]} />

              <View style={styles.cardBadge}>
                <View style={styles.badgeInner}>
                  <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.badgeText}>LIFETIME DEAL</Text>
                  <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.priceRow}>
                  <Text style={[styles.currency, { color: "#D4AF37", fontSize: scaleFont(22) }]}>$</Text>
                  <Text style={[styles.priceMain, { color: "#D4AF37", fontSize: scaleFont(56) }]}>4</Text>
                  <Text style={[styles.priceDecimal, { color: "#D4AF37", fontSize: scaleFont(24) }]}>.99</Text>
                </View>
                <Text style={[styles.oneTime, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
                  One-time payment
                </Text>

                <View style={[styles.divider, { backgroundColor: isDark ? "#2A2720" : "#F0E8D0" }]} />

                <View style={styles.perks}>
                  {[
                    { icon: Zap, text: "Unlimited scans forever" },
                    { icon: Sparkles, text: "Priority AI analysis" },
                    { icon: Shield, text: "No ads, no limits" },
                    { icon: Crown, text: "All future updates included" },
                  ].map((perk, i) => (
                    <View key={i} style={styles.perkRow}>
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                      <Text style={[styles.perkText, { color: theme.text, fontSize: scaleFont(15) }]}>
                        {perk.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {purchaseMutation.isPending ? (
                <View style={styles.buyButton}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.buyButton}>
                  <Text style={[styles.buyButtonText, { fontSize: scaleFont(18) }]}>
                    Unlock Premium
                  </Text>
                  <Sparkles size={20} color="#FFFFFF" />
                </View>
              )}

              <View style={styles.sparkleCornerTL}>
                <Animated.View style={{ opacity: shimmerOpacity1 }}>
                  <Star size={16} color="#D4AF37" fill="#D4AF37" />
                </Animated.View>
              </View>
              <View style={styles.sparkleCornerTR}>
                <Animated.View style={{ opacity: shimmerOpacity2 }}>
                  <Sparkles size={14} color="#D4AF37" />
                </Animated.View>
              </View>
              <View style={styles.sparkleCornerBL}>
                <Animated.View style={{ opacity: shimmerOpacity2 }}>
                  <Star size={12} color="#D4AF37" fill="#D4AF37" />
                </Animated.View>
              </View>
              <View style={styles.sparkleCornerBR}>
                <Animated.View style={{ opacity: shimmerOpacity1 }}>
                  <Sparkles size={16} color="#D4AF37" />
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.disclaimer, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
          Pay once, own it forever. No subscriptions.
        </Text>
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
});
