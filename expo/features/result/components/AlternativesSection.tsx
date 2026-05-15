import { Text, View } from "react-native";
import { Sparkles, ArrowUpRight, Crown } from "lucide-react-native";
import { getGradeColor, AlternativeSuggestion } from "@/types/scan";
import { PremiumBlurOverlay } from "./PremiumBlurOverlay";
import { styles } from "../styles";

export function AlternativesSection({
  alternatives,
  hasPremium,
  theme,
  scaleFont,
}: {
  alternatives: AlternativeSuggestion[];
  hasPremium: boolean;
  theme: { text: string; textSecondary: string; surface: string; card: string };
  scaleFont: (n: number) => number;
}) {
  return (
    <>
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
          {alternatives.map((alt, index) => {
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
        {!hasPremium && <PremiumBlurOverlay cardBackground={theme.card} />}
      </View>
    </>
  );
}
