import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import ReAnimated from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { useScans } from "@/contexts/ScanContext";
import { getGradeColor, Citation } from "@/types/scan";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Trash2, Info, Share2, Camera } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useAnalytics, AnalyticsEvents } from "@/contexts/AnalyticsContext";
import { useState, useEffect } from "react";
import CrossPromo from "@/components/CrossPromo";

import { styles } from "@/features/result/styles";
import { useResultAnimations } from "@/features/result/hooks/useResultAnimations";
import { useCrossPromo } from "@/features/result/hooks/useCrossPromo";
import { shareScan } from "@/features/result/helpers";
import { IngredientCard } from "@/features/result/components/IngredientCard";
import { BehindItSection } from "@/features/result/components/BehindItSection";
import { AlternativesSection } from "@/features/result/components/AlternativesSection";
import { CitationsModal } from "@/features/result/components/CitationsModal";
import { PEPTIDE_PROMO, REGROW_PROMO } from "@/features/result/constants";

export default function ResultScreen() {
  const { scanId, isNewScan } = useLocalSearchParams<{ scanId: string; isNewScan?: string }>();
  const { scans, deleteScan } = useScans();
  const { theme, scaleFont } = useTheme();
  const { hasPremium } = usePurchases();
  const [citationsModalVisible, setCitationsModalVisible] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState<Citation[]>([]);
  const [citationTitle, setCitationTitle] = useState("");
  const { track } = useAnalytics();

  const scan = scans.find((s) => s.id === scanId);

  const {
    slideAnim,
    displayScore,
    scoreAnimStyle,
    productAnimStyle,
    ingredientsAnimStyle,
    premiumAnimStyle,
  } = useResultAnimations(scan, isNewScan);

  const { promoVisible, setPromoVisible, activePromo } = useCrossPromo(scan);

  useEffect(() => {
    if (scan) {
      track(AnalyticsEvents.RESULT_VIEWED, { score: scan.overallScore, grade: scan.gradeLabel });
    }
  }, [scan?.id]);

  if (!scan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textSecondary, fontSize: scaleFont(18) }]}>This scan is no longer available. It may have been deleted.</Text>
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
    track(AnalyticsEvents.RESULT_SHARED, { product: scan.productName, score: scan.overallScore });
    await shareScan(scan);
  };

  const openCitationsModal = (citations: Citation[], title: string) => {
    setSelectedCitations(citations);
    setCitationTitle(title);
    setCitationsModalVisible(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButtonFloating}
            onPress={handleShare}
            accessibilityLabel="Share scan results"
            accessibilityRole="button"
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
              Ingredients ({scan.ingredients?.length ?? 0})
            </Text>

            {scan.ingredients.map((ingredient, index) => (
              <IngredientCard
                key={index}
                ingredient={ingredient}
                theme={theme}
                scaleFont={scaleFont}
                onOpenCitations={openCitationsModal}
              />
            ))}
          </ReAnimated.View>

          {/* BEHIND IT - Premium Feature */}
          {scan.behindIt && (
            <ReAnimated.View style={[styles.premiumSection, premiumAnimStyle]}>
              <BehindItSection
                behindIt={scan.behindIt}
                hasPremium={hasPremium}
                theme={theme}
                scaleFont={scaleFont}
              />
            </ReAnimated.View>
          )}

          {/* ALTERNATIVE SUGGESTIONS - Premium Feature */}
          {scan.alternatives && scan.alternatives.length > 0 && (
            <ReAnimated.View style={[styles.premiumSection, premiumAnimStyle]}>
              <AlternativesSection
                alternatives={scan.alternatives}
                hasPremium={hasPremium}
                theme={theme}
                scaleFont={scaleFont}
              />
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
      <CitationsModal
        visible={citationsModalVisible}
        onClose={() => setCitationsModalVisible(false)}
        citations={selectedCitations}
        title={citationTitle}
        theme={theme}
        scaleFont={scaleFont}
      />

      {/* CROSS-PROMO: Peptide Hub */}
      <CrossPromo
        visible={promoVisible && activePromo === "peptide"}
        onDismiss={() => setPromoVisible(false)}
        appName={PEPTIDE_PROMO.appName}
        tagline={PEPTIDE_PROMO.tagline}
        features={PEPTIDE_PROMO.features}
        iconUrl={PEPTIDE_PROMO.iconUrl}
        iconGradient={PEPTIDE_PROMO.iconGradient}
        appStoreId={PEPTIDE_PROMO.appStoreId}
        promoKey={PEPTIDE_PROMO.promoKey}
      />

      {/* CROSS-PROMO: Snap It Regrow */}
      <CrossPromo
        visible={promoVisible && activePromo === "regrow"}
        onDismiss={() => setPromoVisible(false)}
        appName={REGROW_PROMO.appName}
        tagline={REGROW_PROMO.tagline}
        features={REGROW_PROMO.features}
        iconUrl={REGROW_PROMO.iconUrl}
        iconGradient={REGROW_PROMO.iconGradient}
        appStoreId={REGROW_PROMO.appStoreId}
        promoKey={REGROW_PROMO.promoKey}
      />
    </View>
  );
}
