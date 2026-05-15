import { Text, TouchableOpacity, View } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { getGradeColor, Citation, Ingredient } from "@/types/scan";
import { styles } from "../styles";

export function IngredientCard({
  ingredient,
  theme,
  scaleFont,
  onOpenCitations,
}: {
  ingredient: Ingredient;
  theme: { text: string; textSecondary: string; surface: string };
  scaleFont: (n: number) => number;
  onOpenCitations: (citations: Citation[], title: string) => void;
}) {
  const ingredientColor = getGradeColor(ingredient.rating);
  const hasCitations = ingredient.citations && ingredient.citations.length > 0;

  return (
    <View style={[styles.ingredientCard, { backgroundColor: theme.surface }]}>
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
          onPress={() => onOpenCitations(ingredient.citations!, ingredient.name)}
        >
          <ExternalLink size={14} color="#118AB2" />
          <Text style={[styles.citationsButtonText, { fontSize: scaleFont(12) }]}>
            View Sources ({ingredient.citations!.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
