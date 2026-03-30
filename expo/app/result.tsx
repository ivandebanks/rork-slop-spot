import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Modal,
  Share,
  Alert,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import ReAnimated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing as REasing } from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { useScans } from "@/contexts/ScanContext";
import { getGradeColor, getReputationLabel, Citation } from "@/types/scan";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Trash2, Info, ExternalLink, X, Share2, Building2, ChevronRight, ArrowUpRight, Lock, Crown, Sparkles, Camera } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import * as Sharing from "expo-sharing";
import { useAnalytics, AnalyticsEvents } from "@/contexts/AnalyticsContext";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CrossPromo, { shouldShowPromo } from "@/components/CrossPromo";

export default function ResultScreen() {
  const { scanId, isNewScan } = useLocalSearchParams<{ scanId: string; isNewScan?: string }>();
  const { scans, deleteScan } = useScans();
  const { theme, scaleFont } = useTheme();
  const { hasPremium } = usePurchases();
  const [citationsModalVisible, setCitationsModalVisible] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState<Citation[]>([]);
  const [citationTitle, setCitationTitle] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Staggered entrance animations
  const scoreOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0.5);
  const productOpacity = useSharedValue(0);
  const productTranslateY = useSharedValue(20);
  const ingredientsOpacity = useSharedValue(0);
  const ingredientsTranslateY = useSharedValue(20);
  const premiumOpacity = useSharedValue(0);
  const premiumTranslateY = useSharedValue(20);

  // Score counting animation
  const [displayScore, setDisplayScore] = useState(0);

  // Cross-promo state
  const [promoVisible, setPromoVisible] = useState(false);
  const [activePromo, setActivePromo] = useState<"peptide" | "regrow">("peptide");
  const { track } = useAnalytics();

  const scan = scans.find((s) => s.id === scanId);

  useEffect(() => {
    if (scan) {
      track(AnalyticsEvents.RESULT_VIEWED, { score: scan.overallScore, grade: scan.gradeLabel });
    }
  }, [scan?.id]);

  useEffect(() => {
    // Only animate if it's a new scan
    if (isNewScan !== "true") return;

    // Start with a small delay to ensure the user sees the red screen
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 2500, // Slow drip
        useNativeDriver: true,
        easing: Easing.in(Easing.exp), // Accelerate downwards like a drip
      }).start();
    }, 1000);
    return () => clearTimeout(timer);
  }, [isNewScan]);

  useEffect(() => {
    // Haptic on results load
    if (scan && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Staggered entrance
    const delay = isNewScan === "true" ? 3200 : 200;
    scoreOpacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    scoreScale.value = withDelay(delay, withTiming(1, { duration: 600, easing: REasing.out(REasing.back(1.5)) }));
    productOpacity.value = withDelay(delay + 200, withTiming(1, { duration: 500 }));
    productTranslateY.value = withDelay(delay + 200, withTiming(0, { duration: 500 }));
    ingredientsOpacity.value = withDelay(delay + 400, withTiming(1, { duration: 500 }));
    ingredientsTranslateY.value = withDelay(delay + 400, withTiming(0, { duration: 500 }));
    premiumOpacity.value = withDelay(delay + 600, withTiming(1, { duration: 500 }));
    premiumTranslateY.value = withDelay(delay + 600, withTiming(0, { duration: 500 }));

    // Score counting animation
    if (scan) {
      const target = Math.round(scan.overallScore);
      const startDelay = isNewScan === "true" ? 3400 : 400;
      const counterTimer = setTimeout(() => {
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          setDisplayScore(current);
          if (current >= target) clearInterval(interval);
        }, 30);
      }, startDelay);
      return () => clearTimeout(counterTimer);
    }
  }, [scan?.id]);

  // Cross-promo: show 8 seconds after results load, alternating between Math and Regrow
  useEffect(() => {
    if (!scan) return;

    const SCAN_COUNT_KEY = "cross_promo_scan_count";
    const COUNTER_KEY = "cross_promo_alt_counter";
    const SCANS_BETWEEN_PROMOS = 3;

    const checkAndShowPromo = async () => {
      try {
        // Increment scan count
        const countStr = await AsyncStorage.getItem(SCAN_COUNT_KEY);
        const scanCount = (countStr ? parseInt(countStr, 10) : 0) + 1;
        await AsyncStorage.setItem(SCAN_COUNT_KEY, String(scanCount));

        // Only show promo every few scans
        if (scanCount % SCANS_BETWEEN_PROMOS !== 0) return;

        // Alternate between Peptide Hub and Regrow
        const counterStr = await AsyncStorage.getItem(COUNTER_KEY);
        const counter = counterStr ? parseInt(counterStr, 10) : 0;
        const isPeptideTurn = counter % 2 === 0;

        const primaryKey = isPeptideTurn ? "promo_peptide" : "promo_regrow";
        const fallbackKey = isPeptideTurn ? "promo_regrow" : "promo_peptide";

        let canShow = await shouldShowPromo(primaryKey);
        let chosenPromo: "peptide" | "regrow" = isPeptideTurn ? "peptide" : "regrow";

        if (!canShow) {
          canShow = await shouldShowPromo(fallbackKey);
          chosenPromo = isPeptideTurn ? "regrow" : "peptide";
        }

        if (canShow) {
          setActivePromo(chosenPromo);
          setPromoVisible(true);
          await AsyncStorage.setItem(COUNTER_KEY, String(counter + 1));
        }
      } catch {
        // silent
      }
    };

    const timer = setTimeout(checkAndShowPromo, 2000);
    return () => clearTimeout(timer);
  }, [scan?.id]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));
  const productAnimStyle = useAnimatedStyle(() => ({
    opacity: productOpacity.value,
    transform: [{ translateY: productTranslateY.value }],
  }));
  const ingredientsAnimStyle = useAnimatedStyle(() => ({
    opacity: ingredientsOpacity.value,
    transform: [{ translateY: ingredientsTranslateY.value }],
  }));
  const premiumAnimStyle = useAnimatedStyle(() => ({
    opacity: premiumOpacity.value,
    transform: [{ translateY: premiumTranslateY.value }],
  }));

  if (!scan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: scaleFont(18) }]}>Scan not found</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { fontSize: scaleFont(16) }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const gradeColor = getGradeColor(scan.overallScore);

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    deleteScan(scan.id);
    router.back();
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // Create a formatted message with the scan results
      const ingredientsList = scan.ingredients
        .map((ing, idx) => `${idx + 1}. ${ing.name} (${Math.round(ing.rating)}/100)`)
        .join('\n');

      const message = `${scan.productName} - Health Score: ${Math.round(scan.overallScore)}/100 (${scan.gradeLabel})

Ingredients (${scan.ingredients.length}):
${ingredientsList}

Scanned with Kiwi - Better Health Scanner
Download: https://apps.apple.com/app/id6757214914`;

      track(AnalyticsEvents.RESULT_SHARED, { product: scan.productName, score: scan.overallScore });
      const result = await Share.share({
        message: message,
        title: `${scan.productName} Health Scan`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
        } else {
          // Shared successfully
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share the scan results');
      console.error('Error sharing:', error);
    }
  };

  const openCitationsModal = (citations: Citation[], title: string) => {
    setSelectedCitations(citations);
    setCitationTitle(title);
    setCitationsModalVisible(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isNewScan === "true" && (
        <Animated.View 
          style={[
            styles.dripOverlay, 
            { transform: [{ translateY: slideAnim }] }
          ]} 
        />
      )}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={scan.imageUri} style={styles.image} contentFit="cover" transition={300} />
          <TouchableOpacity
            style={styles.backButtonFloating}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButtonFloating}
            onPress={handleShare}
          >
            <Share2 size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
          <ReAnimated.View style={scoreAnimStyle}>
            <View style={[styles.scoreCircle, { backgroundColor: gradeColor }]}>
              <Text style={[styles.scoreNumber, { fontSize: scaleFont(48) }]}>{displayScore}</Text>
              <Text style={[styles.scoreOutOf, { fontSize: scaleFont(16) }]}>/100</Text>
            </View>
          </ReAnimated.View>

          <ReAnimated.View style={productAnimStyle}>
            <Text style={[styles.gradeLabel, { color: gradeColor, fontSize: scaleFont(28) }]}>
              {scan.gradeLabel}
            </Text>

            <Text style={[styles.productName, { color: theme.text, fontSize: scaleFont(20) }]}>{scan.productName}</Text>
          </ReAnimated.View>

          <ReAnimated.View style={[styles.section, ingredientsAnimStyle]}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
              Ingredients ({scan.ingredients.length})
            </Text>

            {scan.ingredients.map((ingredient, index) => {
              const ingredientColor = getGradeColor(ingredient.rating);
              const hasCitations = ingredient.citations && ingredient.citations.length > 0;

              return (
                <View key={index} style={[styles.ingredientCard, { backgroundColor: theme.surface }]}>
                  <View style={styles.ingredientHeader}>
                    <View style={styles.ingredientNameContainer}>
                      <View
                        style={[
                          styles.ingredientDot,
                          { backgroundColor: ingredientColor },
                        ]}
                      />
                      <Text style={[styles.ingredientName, { color: theme.text, fontSize: scaleFont(16) }]}>{ingredient.name}</Text>
                    </View>
                    <View
                      style={[
                        styles.ingredientScore,
                        { backgroundColor: ingredientColor + "20" },
                      ]}
                    >
                      <Text style={[styles.ingredientScoreText, { color: ingredientColor, fontSize: scaleFont(14) }]}>
                        {Math.round(ingredient.rating)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.healthImpact, { color: theme.text, fontSize: scaleFont(14) }]}>{ingredient.healthImpact}</Text>
                  <Text style={[styles.explanation, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>{ingredient.explanation}</Text>

                  {/* CITATIONS BUTTON - REQUIRED BY APPLE */}
                  {hasCitations && (
                    <TouchableOpacity
                      style={styles.citationsButton}
                      onPress={() => openCitationsModal(ingredient.citations!, ingredient.name)}
                    >
                      <ExternalLink size={14} color="#118AB2" />
                      <Text style={[styles.citationsButtonText, { fontSize: scaleFont(12) }]}>
                        View Sources ({ingredient.citations!.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ReAnimated.View>

          {/* BEHIND IT - Premium Feature */}
          {scan.behindIt && (
            <ReAnimated.View style={[styles.premiumSection, premiumAnimStyle]}>
              <View style={styles.premiumSectionHeader}>
                <Building2 size={20} color={theme.text} />
                <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
                  Behind It
                </Text>
                {!hasPremium && (
                  <View style={styles.premiumBadge}>
                    <Crown size={10} color="#FFFFFF" />
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                )}
              </View>

              <View style={styles.premiumContentWrapper}>
                <View style={[styles.behindItCard, { backgroundColor: theme.surface }]}>
                  <View style={styles.companyRow}>
                    <View style={[styles.companyDot, { backgroundColor: theme.primary }]} />
                    <View style={styles.companyInfo}>
                      <Text style={[styles.companyLabel, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>Made by</Text>
                      <Text style={[styles.companyName, { color: theme.text, fontSize: scaleFont(15) }]}>{scan.behindIt.company}</Text>
                    </View>
                  </View>
                  {scan.behindIt.parentCompany && (
                    <>
                      <View style={styles.ownershipArrow}>
                        <ChevronRight size={14} color={theme.textSecondary} />
                      </View>
                      <View style={styles.companyRow}>
                        <View style={[styles.companyDot, { backgroundColor: "#F77F00" }]} />
                        <View style={styles.companyInfo}>
                          <Text style={[styles.companyLabel, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>Owned by</Text>
                          <Text style={[styles.companyName, { color: theme.text, fontSize: scaleFont(15) }]}>{scan.behindIt.parentCompany}</Text>
                        </View>
                      </View>
                    </>
                  )}
                  {scan.behindIt.ultimateParent && (
                    <>
                      <View style={styles.ownershipArrow}>
                        <ChevronRight size={14} color={theme.textSecondary} />
                      </View>
                      <View style={styles.companyRow}>
                        <View style={[styles.companyDot, { backgroundColor: "#E63946" }]} />
                        <View style={styles.companyInfo}>
                          <Text style={[styles.companyLabel, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>Ultimate Parent</Text>
                          <Text style={[styles.companyName, { color: theme.text, fontSize: scaleFont(15) }]}>{scan.behindIt.ultimateParent}</Text>
                        </View>
                      </View>
                    </>
                  )}

                  {/* Company Reputation Score */}
                  {scan.behindIt.reputationScore != null && (
                    <View style={styles.reputationContainer}>
                      <View style={styles.reputationHeader}>
                        <Text style={[styles.companyLabel, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>COMPANY REPUTATION</Text>
                      </View>
                      <View style={styles.reputationBarBackground}>
                        <View style={[styles.reputationBarFill, { width: `${scan.behindIt.reputationScore}%`, backgroundColor: getGradeColor(scan.behindIt.reputationScore) }]} />
                      </View>
                      <View style={styles.reputationFooter}>
                        <Text style={[styles.reputationLabel, { color: getGradeColor(scan.behindIt.reputationScore), fontSize: scaleFont(13) }]}>
                          {getReputationLabel(scan.behindIt.reputationScore)}
                        </Text>
                        <Text style={[styles.reputationScore, { color: theme.text, fontSize: scaleFont(14) }]}>
                          {scan.behindIt.reputationScore}/100
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Blur overlay for non-premium users */}
                {!hasPremium && (
                  <View style={styles.blurOverlay}>
                    <View style={[styles.blurBackground, { backgroundColor: theme.card }]} />
                    <TouchableOpacity
                      style={styles.unlockButton}
                      onPress={() => router.push("/paywall" as any)}
                    >
                      <Lock size={18} color="#D4AF37" />
                      <Text style={styles.unlockText}>Unlock with Premium</Text>
                      <ArrowUpRight size={14} color="#D4AF37" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ReAnimated.View>
          )}

          {/* ALTERNATIVE SUGGESTIONS - Premium Feature */}
          {scan.alternatives && scan.alternatives.length > 0 && (
            <ReAnimated.View style={[styles.premiumSection, premiumAnimStyle]}>
              <View style={styles.premiumSectionHeader}>
                <Sparkles size={20} color={theme.text} />
                <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
                  Healthier Alternatives
                </Text>
                {!hasPremium && (
                  <View style={styles.premiumBadge}>
                    <Crown size={10} color="#FFFFFF" />
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                )}
              </View>

              <View style={styles.premiumContentWrapper}>
                <View style={styles.alternativesList}>
                  {scan.alternatives.map((alt, index) => {
                    const altColor = getGradeColor(alt.estimatedScore);
                    return (
                      <View key={index} style={[styles.alternativeCard, { backgroundColor: theme.surface }]}>
                        <View style={[styles.altScoreBadge, { backgroundColor: altColor }]}>
                          <Text style={styles.altScoreText}>{alt.estimatedScore}</Text>
                        </View>
                        <View style={styles.altInfo}>
                          <Text style={[styles.altProductName, { color: theme.text, fontSize: scaleFont(14) }]} numberOfLines={1}>
                            {alt.productName}
                          </Text>
                          <Text style={[styles.altReason, { color: theme.textSecondary, fontSize: scaleFont(12) }]} numberOfLines={2}>
                            {alt.reason}
                          </Text>
                        </View>
                        <View style={[styles.altArrow, { backgroundColor: altColor + "15" }]}>
                          <ArrowUpRight size={14} color={altColor} />
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Blur overlay for non-premium users */}
                {!hasPremium && (
                  <View style={styles.blurOverlay}>
                    <View style={[styles.blurBackground, { backgroundColor: theme.card }]} />
                    <TouchableOpacity
                      style={styles.unlockButton}
                      onPress={() => router.push("/paywall" as any)}
                    >
                      <Lock size={18} color="#D4AF37" />
                      <Text style={styles.unlockText}>Unlock with Premium</Text>
                      <ArrowUpRight size={14} color="#D4AF37" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ReAnimated.View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.primary }]} onPress={handleShare}>
              <Share2 size={20} color="#FFFFFF" />
              <Text style={[styles.shareButtonText, { fontSize: scaleFont(16) }]}>Share Results</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={20} color="#E63946" />
              <Text style={[styles.deleteButtonText, { fontSize: scaleFont(16) }]}>Delete Scan</Text>
            </TouchableOpacity>
          </View>

          {/* Scan Another Button */}
          <TouchableOpacity
            style={[styles.scanAnotherButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.replace("/(tabs)");
            }}
          >
            <Camera size={20} color="#FFFFFF" />
            <Text style={[styles.scanAnotherText, { fontSize: scaleFont(16) }]}>Scan Another</Text>
          </TouchableOpacity>

          {/* ENTERTAINMENT DISCLAIMER - REQUIRED BY APPLE */}
          <View style={styles.disclaimerCard}>
            <Info size={18} color="#FFA500" strokeWidth={2.5} />
            <View style={styles.disclaimerContent}>
              <Text style={[styles.disclaimerTitle, { fontSize: scaleFont(13) }]}>AI-Generated Analysis</Text>
              <Text style={[styles.disclaimerText, { fontSize: scaleFont(12) }]}>
                AI-generated analysis. Not medical advice. Consult healthcare professionals for dietary decisions.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CITATIONS MODAL */}
      <Modal
        visible={citationsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCitationsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
                Sources: {citationTitle}
              </Text>
              <TouchableOpacity onPress={() => setCitationsModalVisible(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.citationsList}>
              {selectedCitations.map((citation, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.citationItem, { backgroundColor: theme.surface }]}
                  onPress={() => openURL(citation.url)}
                >
                  <View style={styles.citationTextContainer}>
                    <Text style={[styles.citationSource, { color: theme.primary, fontSize: scaleFont(12) }]}>
                      {citation.source}
                    </Text>
                    <Text style={[styles.citationTitle, { color: theme.text, fontSize: scaleFont(14) }]}>
                      {citation.title}
                    </Text>
                    <Text style={[styles.citationUrl, { color: theme.textSecondary, fontSize: scaleFont(12) }]} numberOfLines={1}>
                      {citation.url}
                    </Text>
                  </View>
                  <ExternalLink size={16} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setCitationsModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { fontSize: scaleFont(16) }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CROSS-PROMO: Peptide Hub */}
      <CrossPromo
        visible={promoVisible && activePromo === "peptide"}
        onDismiss={() => setPromoVisible(false)}
        appName="Peptide Hub"
        tagline="Your complete guide to peptides, dosing & protocols."
        features={[
          "Science-backed peptide database",
          "Dosing calculators & protocols",
          "Track your peptide cycles",
        ]}
        iconUrl="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b4/2c/63/b42c63f3-5b8d-b794-f7b2-62d0560bc4c8/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/512x512bb.jpg"
        iconGradient={["#8B5CF6", "#7C3AED"]}
        appStoreId="6759482842"
        promoKey="promo_peptide"
      />

      {/* CROSS-PROMO: Snap It Regrow */}
      <CrossPromo
        visible={promoVisible && activePromo === "regrow"}
        onDismiss={() => setPromoVisible(false)}
        appName="Snap It: Regrow"
        tagline="Worried about more than food? Track your hair health."
        features={[
          "AI scalp analysis",
          "Norwood stage tracking",
          "Personalized action plans",
        ]}
        iconUrl="https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/4e/83/d8/4e83d812-da39-69f7-8cb5-209af9e8f204/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg"
        iconGradient={["#10b981", "#059669"]}
        appStoreId="6758930237"
        promoKey="promo_regrow"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 300,
    backgroundColor: "#E0E0E0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backButtonFloating: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonFloating: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  disclaimerCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.3)",
    gap: 10,
    width: "100%",
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFA500",
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  scoreOutOf: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  gradeLabel: {
    fontSize: 28,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: "600" as const,
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    width: "100%",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  ingredientCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  ingredientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingredientNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  ingredientDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
  },
  ingredientScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ingredientScoreText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  healthImpact: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
  },
  citationsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(17, 138, 178, 0.1)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  citationsButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#118AB2",
  },
  actionButtons: {
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E63946",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#E63946",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    flex: 1,
  },
  citationsList: {
    maxHeight: 400,
  },
  citationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    alignItems: "center",
  },
  citationTextContainer: {
    flex: 1,
    gap: 4,
  },
  citationSource: {
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase",
  },
  citationTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 18,
  },
  citationUrl: {
    fontSize: 12,
    fontStyle: "italic",
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  dripOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "#FF6347", // Tomato red
    zIndex: 9999,
    elevation: 100,
  },
  // Premium sections
  premiumSection: {
    width: "100%",
    marginTop: 24,
    gap: 12,
  },
  premiumSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: "auto",
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  premiumContentWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
  },
  // Behind It
  behindItCard: {
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  companyInfo: {
    flex: 1,
    gap: 1,
  },
  companyLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  ownershipArrow: {
    paddingLeft: 24,
  },
  reputationContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.15)",
    gap: 6,
  },
  reputationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reputationBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(128, 128, 128, 0.15)",
    borderRadius: 4,
    overflow: "hidden",
  },
  reputationBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  reputationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reputationLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  reputationScore: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  // Alternatives
  alternativesList: {
    gap: 8,
  },
  alternativeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  altScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  altScoreText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  altInfo: {
    flex: 1,
    gap: 2,
  },
  altProductName: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  altReason: {
    fontSize: 12,
    lineHeight: 16,
  },
  altArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  // Blur overlay for premium gate
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.85,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  unlockText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#D4AF37",
  },
  scanAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    width: "100%",
  },
  scanAnotherText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});