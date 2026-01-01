import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useScans } from "@/contexts/ScanContext";
import { getGradeColor } from "@/types/scan";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

export default function ResultScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const { scans, deleteScan } = useScans();
  const { theme, scaleFont } = useTheme();

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
        </View>

        <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
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
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={20} color="#E63946" />
            <Text style={[styles.deleteButtonText, { fontSize: scaleFont(16) }]}>Delete Scan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
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
});
