import React, { useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import ReAnimated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Check, Star, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/ThemeContext";

interface CrossPromoProps {
  visible: boolean;
  onDismiss: () => void;
  appName: string;
  tagline: string;
  features: string[];
  icon?: React.ComponentType<any>;
  iconUrl?: string;
  iconGradient: [string, string];
  appStoreId: string;
  promoKey: string;
}

const DISMISS_PREFIX = "cross_promo_dismissed_";
const LAST_SHOWN_PREFIX = "cross_promo_last_shown_";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export async function shouldShowPromo(promoKey: string): Promise<boolean> {
  try {
    const dismissed = await AsyncStorage.getItem(DISMISS_PREFIX + promoKey);
    if (dismissed === "true") return false;

    const lastShown = await AsyncStorage.getItem(LAST_SHOWN_PREFIX + promoKey);
    if (lastShown) {
      const elapsed = Date.now() - parseInt(lastShown, 10);
      if (elapsed < THREE_DAYS_MS) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function markPromoShown(promoKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_PREFIX + promoKey, String(Date.now()));
  } catch {
    // silent
  }
}

export async function dismissPromoPermanently(promoKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISS_PREFIX + promoKey, "true");
  } catch {
    // silent
  }
}

export default function CrossPromo({
  visible,
  onDismiss,
  appName,
  tagline,
  features,
  icon: IconComponent,
  iconUrl,
  iconGradient,
  appStoreId,
  promoKey,
}: CrossPromoProps) {
  const { theme, activeColorScheme } = useTheme();

  useEffect(() => {
    if (visible) {
      markPromoShown(promoKey);
    }
  }, [visible, promoKey]);

  const handleCheckItOut = useCallback(async () => {
    const url =
      Platform.OS === "ios"
        ? `https://apps.apple.com/app/id${appStoreId}`
        : `https://play.google.com/store/apps/details?id=${appStoreId}`;
    try {
      await Linking.openURL(url);
    } catch {
      // silent
    }
    onDismiss();
  }, [appStoreId, onDismiss]);

  const handleNotNow = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const handleDismissPermanently = useCallback(() => {
    dismissPromoPermanently(promoKey);
    onDismiss();
  }, [promoKey, onDismiss]);

  if (!visible) return null;

  const isDark = activeColorScheme === "dark";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleNotNow}
      statusBarTranslucent
    >
      <ReAnimated.View
        entering={FadeIn.duration(300)}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.scrimTouchable}
          activeOpacity={1}
          onPress={handleNotNow}
        />

        <ReAnimated.View
          entering={FadeInDown.duration(400).springify().damping(18)}
          style={styles.sheetWrapper}
        >
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={styles.blurContainer}
          >
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: isDark
                    ? "rgba(30, 30, 30, 0.85)"
                    : "rgba(255, 255, 255, 0.85)",
                },
              ]}
            >
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleNotNow}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close promotion"
                accessibilityRole="button"
              >
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              {/* App Icon */}
              {iconUrl ? (
                <Image source={iconUrl} style={styles.appIcon} contentFit="cover" transition={200} />
              ) : (
                <LinearGradient
                  colors={iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.appIcon}
                >
                  {IconComponent && <IconComponent size={40} color="#FFFFFF" strokeWidth={2} />}
                </LinearGradient>
              )}

              {/* App Name */}
              <Text style={[styles.appName, { color: theme.text }]}>
                {appName}
              </Text>

              {/* Tagline */}
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                {tagline}
              </Text>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View
                      style={[
                        styles.checkCircle,
                        { backgroundColor: iconGradient[0] + "20" },
                      ]}
                    >
                      <Check size={14} color={iconGradient[0]} strokeWidth={3} />
                    </View>
                    <Text
                      style={[styles.featureText, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Star Rating */}
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    color="#F5A623"
                    fill="#F5A623"
                    strokeWidth={0}
                  />
                ))}
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  4.8
                </Text>
              </View>

              {/* CTA Button */}
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleCheckItOut}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>Check It Out</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Not now */}
              <TouchableOpacity
                onPress={handleDismissPermanently}
                style={styles.notNowButton}
              >
                <Text style={[styles.notNowText, { color: theme.textSecondary }]}>
                  Not now
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </ReAnimated.View>
      </ReAnimated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  scrimTouchable: {
    flex: 1,
  },
  sheetWrapper: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  blurContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  sheet: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 28,
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(128, 128, 128, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
  ctaButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  notNowButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  notNowText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
