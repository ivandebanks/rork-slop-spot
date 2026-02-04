import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { X, Check, Zap, Sparkles, AlertCircle, RefreshCw } from "lucide-react-native";
import { PurchasesPackage } from "react-native-purchases";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function PaywallScreen() {
  const { offerings, purchaseMutation, scansRemaining, isLoading, error } = usePurchases();
  const { theme, scaleFont } = useTheme();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Debug logging for TestFlight
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
        console.error("Purchase error:", error);
        // Show error to user
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

  // Loading state
  if (isLoading || !offerings) {
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
            Loading plans...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
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
            Unable to Load Plans
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
            {error?.message || "Please check your internet connection and try again."}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              queryClient.invalidateQueries({ queryKey: ["offerings"] });
              queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
            }}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={[styles.retryButtonText, { fontSize: scaleFont(16) }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const packages = offerings.current.availablePackages;
  
  // Filter and sort packages
  const subscriptions = packages.filter(p => 
    p.packageType === "MONTHLY" || 
    p.packageType === "ANNUAL" ||
    p.identifier.toLowerCase().includes("premium") || 
    p.identifier.toLowerCase().includes("unlimited")
  ).sort((a, b) => {
    // Sort by price, highest first (Premium $9.99 should be first)
    return b.product.price - a.product.price;
  });
  
  const oneTimePurchases = packages.filter(p => 
    p.packageType === "LIFETIME" ||
    p.identifier.toLowerCase().includes("scans") && !p.identifier.toLowerCase().includes("unlimited")
  ).sort((a, b) => {
    // Sort by price, highest first (30 scans at top, 1 scan at bottom)
    return b.product.price - a.product.price;
  });

  // If no packages found
  if (packages.length === 0) {
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
            {subscriptions.map((pkg, index) => {
              // Premium should be first (highest price), Unlimited second
              const isPremium = pkg.identifier.toLowerCase().includes("premium");
              const isUnlimited = pkg.identifier.toLowerCase().includes("unlimited");
              const isAnnual = pkg.packageType === "ANNUAL";
              
              // Get display title from product or use fallback
              let displayTitle = pkg.product.title;
              if (isPremium && !displayTitle.toLowerCase().includes("premium")) {
                displayTitle = "Premium";
              } else if (isUnlimited && !displayTitle.toLowerCase().includes("unlimited")) {
                displayTitle = "Unlimited Scans";
              }
              
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: isPremium ? theme.primary : theme.border,
                      borderWidth: isPremium ? 2 : 1,
                    }
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchaseMutation.isPending}
                >
                  {isPremium && (
                    <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                      <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={[styles.badgeText, { fontSize: scaleFont(12) }]}>
                        Best Value
                      </Text>
                    </View>
                  )}
                  <View style={styles.packageHeader}>
                    <View>
                      <Text style={[styles.packageTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
                        {displayTitle}
                      </Text>
                      {isPremium && (
                        <Text style={[styles.packageSubtitle, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
                          Most popular choice
                        </Text>
                      )}
                      {isUnlimited && (
                        <Text style={[styles.packageSubtitle, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
                          Great value
                        </Text>
                      )}
                      {isAnnual && (
                        <Text style={[styles.packageSubtitle, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
                          Save with annual
                        </Text>
                      )}
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.packagePrice, { color: theme.primary, fontSize: scaleFont(24) }]}>
                        {pkg.product.priceString}
                      </Text>
                      <Text style={[styles.pricePeriod, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
                        {isAnnual ? '/year' : '/month'}
                      </Text>
                    </View>
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
                // Extract number from identifier first, then title, then description
                let scanCount = "1";
                
                // Try identifier first (e.g., scans_30, scans_20, etc.)
                const idMatch = pkg.identifier.match(/scans?[_-]?(\d+)/i);
                if (idMatch) {
                  scanCount = idMatch[1];
                } else {
                  // Try product title (e.g., "30 Scans", "20 Scans")
                  const titleMatch = pkg.product.title.match(/(\d+)\s*scans?/i);
                  if (titleMatch) {
                    scanCount = titleMatch[1];
                  } else {
                    // Try just any number in title
                    const anyNumber = pkg.product.title.match(/\d+/);
                    if (anyNumber) {
                      scanCount = anyNumber[0];
                    }
                  }
                }
                
                // Determine if singular or plural
                const isPlural = parseInt(scanCount) !== 1;
                
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
                      {isPlural ? 'scans' : 'scan'}
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  packageSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  pricePeriod: {
    fontSize: 12,
    marginTop: 2,
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