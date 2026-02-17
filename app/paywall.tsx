import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from "react-native";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { X, Check, Crown, Shield, Zap, Star } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

export default function PaywallScreen() {
  const { scansRemaining } = usePurchases();
  const { theme, scaleFont } = useTheme();

  const starSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(starSpin, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

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
              <View style={[styles.divider, { backgroundColor: isDark ? "#2A2720" : "#F0E8D0" }]} />

              <View style={styles.perks}>
                {[
                  { text: "Unlimited scans forever" },
                  { text: "Priority AI analysis" },
                  { text: "No ads, no limits" },
                  { text: "All future updates included" },
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
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
          In-app purchases are currently unavailable.
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
