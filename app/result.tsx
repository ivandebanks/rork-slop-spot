import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
  Modal,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useScans } from "@/contexts/ScanContext";
import { getGradeColor } from "@/types/scan";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Trash2, Info, ExternalLink, X, Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { Citation } from "@/types/scan";

export default function ResultScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const { scans, deleteScan } = useScans();
  const { theme, scaleFont } = useTheme();
  const [citationsModalVisible, setCitationsModalVisible] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState<Citation[]>([]);
  const [citationTitle, setCitationTitle] = useState("");

  const scan = scans.find((s) => s.id === scanId);

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

Scanned with Slop Spot`;

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: scan.imageUri }} style={styles.image} />
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
          {/* ENTERTAINMENT DISCLAIMER - REQUIRED BY APPLE */}
          <View style={styles.disclaimerCard}>
            <Info size={18} color="#FFA500" strokeWidth={2.5} />
            <View style={styles.disclaimerContent}>
              <Text style={[styles.disclaimerTitle, { fontSize: scaleFont(13) }]}>For Entertainment Only</Text>
              <Text style={[styles.disclaimerText, { fontSize: scaleFont(12) }]}>
                Ingredient ratings are for informational and entertainment purposes only. This is not medical advice, nutritional guidance, or professionally validated health information. Consult healthcare professionals for dietary decisions.
              </Text>
            </View>
          </View>

          <View style={[styles.scoreCircle, { backgroundColor: gradeColor }]}>
            <Text style={[styles.scoreNumber, { fontSize: scaleFont(48) }]}>{Math.round(scan.overallScore)}</Text>
            <Text style={[styles.scoreOutOf, { fontSize: scaleFont(16) }]}>/100</Text>
          </View>

          <Text style={[styles.gradeLabel, { color: gradeColor, fontSize: scaleFont(28) }]}>
            {scan.gradeLabel}
          </Text>

          <Text style={[styles.productName, { color: theme.text, fontSize: scaleFont(20) }]}>{scan.productName}</Text>

          <View style={styles.section}>
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
          </View>

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
    marginBottom: 20,
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
});