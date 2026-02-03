import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { X, Check, Zap, Sparkles } from "lucide-react-native";
import { PurchasesPackage } from "react-native-purchases";
import * as Haptics from "expo-haptics";

export default function PaywallScreen() {
  const { offerings, purchaseMutation, scansRemaining } = usePurchases();
  const { theme, scaleFont } = useTheme();

  const handlePurchase = async (pkg: PurchasesPackage) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      await purchaseMutation.mutateAsync(pkg);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch (error: any) {
      if (!error.userCancelled) {
        console.log("Purchase error:", error);
      }
    }
  };

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  if (!offerings || !offerings.current) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const packages = offerings.current.availablePackages;
  const subscriptions = packages.filter(p => 
    p.identifier.includes("premium") || p.identifier.includes("unlimited")
  );
  const oneTimePurchases = packages.filter(p => 
    p.identifier.includes("scans_")
  ).sort((a, b) => {
    const getNum = (id: string) => parseInt(id.match(/\d+/)?.[0] || "0", 10);
    return getNum(b.identifier) - getNum(a.identifier);
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Sparkles size={32} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text, fontSize: scaleFont(28) }]}>
            Upgrade Your Scans
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
            You have {scansRemaining} scans remaining
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {subscriptions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(20) }]}>
              Subscriptions
            </Text>
            {subscriptions.map((pkg) => {
              const isUnlimited = pkg.identifier.includes("unlimited");
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: isUnlimited ? theme.primary : theme.border,
                      borderWidth: isUnlimited ? 2 : 1,
                    }
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchaseMutation.isPending}
                >
                  {isUnlimited && (
                    <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                      <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={[styles.badgeText, { fontSize: scaleFont(12) }]}>
                        Best Value
                      </Text>
                    </View>
                  )}
                  <View style={styles.packageHeader}>
                    <Text style={[styles.packageTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
                      {pkg.product.title}
                    </Text>
                    <Text style={[styles.packagePrice, { color: theme.primary, fontSize: scaleFont(24) }]}>
                      {pkg.product.priceString}/mo
                    </Text>
                  </View>
                  <View style={styles.features}>
                    <View style={styles.feature}>
                      <Check size={16} color={theme.primary} />
                      <Text style={[styles.featureText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
                        Unlimited daily scans
                      </Text>
                    </View>
                    <View style={styles.feature}>
                      <Check size={16} color={theme.primary} />
                      <Text style={[styles.featureText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
                        Priority analysis
                      </Text>
                    </View>
                    <View style={styles.feature}>
                      <Check size={16} color={theme.primary} />
                      <Text style={[styles.featureText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
                        Cancel anytime
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {oneTimePurchases.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(20), marginTop: 24 }]}>
              Scan Packs
            </Text>
            <View style={styles.packsGrid}>
              {oneTimePurchases.map((pkg) => {
                const scanCount = pkg.identifier.match(/\d+/)?.[0] || "1";
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.packCard,
                      { 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => handlePurchase(pkg)}
                    disabled={purchaseMutation.isPending}
                  >
                    <Text style={[styles.packCount, { color: theme.text, fontSize: scaleFont(32) }]}>
                      {scanCount}
                    </Text>
                    <Text style={[styles.packLabel, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
                      scans
                    </Text>
                    <Text style={[styles.packPrice, { color: theme.primary, fontSize: scaleFont(18) }]}>
                      {pkg.product.priceString}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <Text style={[styles.disclaimer, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
          Subscriptions auto-renew unless cancelled 24 hours before the period ends.
          {"\n"}
          Manage subscriptions in your account settings.
        </Text>
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
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  headerContent: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  packageCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  badge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  features: {
    gap: 12,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  packsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  packCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  packCount: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  packLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  packPrice: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 24,
  },
});
