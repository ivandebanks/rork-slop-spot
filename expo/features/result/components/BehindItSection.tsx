import { Text, View } from "react-native";
import { Building2, ChevronRight, Crown } from "lucide-react-native";
import { getGradeColor, getReputationLabel, CompanyOwnership } from "@/types/scan";
import { PremiumBlurOverlay } from "./PremiumBlurOverlay";
import { styles } from "../styles";

export function BehindItSection({
  behindIt,
  hasPremium,
  theme,
  scaleFont,
}: {
  behindIt: CompanyOwnership;
  hasPremium: boolean;
  theme: { text: string; textSecondary: string; surface: string; card: string; primary: string };
  scaleFont: (n: number) => number;
}) {
  return (
    <>
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
              <Text style={[styles.companyName, { color: theme.text, fontSize: scaleFont(15) }]}>{behindIt.company}</Text>
            </View>
          </View>
          {behindIt.parentCompany && (
            <>
              <View style={styles.ownershipArrow}>
                <ChevronRight size={14} color={theme.textSecondary} />
              </View>
              <View style={styles.companyRow}>
                <View style={[styles.companyDot, { backgroundColor: "#F77F00" }]} />
                <View style={styles.companyInfo}>
                  <Text style={[styles.companyLabel, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>Owned by</Text>
                  <Text style={[styles.companyName, { color: theme.text, fontSize: scaleFont(15) }]}>{behindIt.parentCompany}</Text>
                </View>
              </View>
            </>
          )}
          {behindIt.ultimateParent && (
            <>
              <View style={styles.ownershipArrow}>
                <ChevronRight size={14} color={theme.textSecondary} />
              </View>
              <View style={styles.companyRow}>
                <View style={[styles.companyDot, { backgroundColor: "#E63946" }]} />
                <View style={styles.companyInfo}>
                  <Text style={[styles.companyLabel, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>Ultimate Parent</Text>
                  <Text style={[styles.companyName, { color: theme.text, fontSize: scaleFont(15) }]}>{behindIt.ultimateParent}</Text>
                </View>
              </View>
            </>
          )}

          {/* Company Reputation Score */}
          {behindIt.reputationScore != null && (
            <View style={styles.reputationContainer}>
              <View style={styles.reputationHeader}>
                <Text style={[styles.companyLabel, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>COMPANY REPUTATION</Text>
              </View>
              <View style={styles.reputationBarBackground}>
                <View style={[styles.reputationBarFill, { width: `${behindIt.reputationScore}%`, backgroundColor: getGradeColor(behindIt.reputationScore) }]} />
              </View>
              <View style={styles.reputationFooter}>
                <Text style={[styles.reputationLabel, { color: getGradeColor(behindIt.reputationScore), fontSize: scaleFont(13) }]}>
                  {getReputationLabel(behindIt.reputationScore)}
                </Text>
                <Text style={[styles.reputationScore, { color: theme.text, fontSize: scaleFont(14) }]}>
                  {behindIt.reputationScore}/100
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Blur overlay for non-premium users */}
        {!hasPremium && <PremiumBlurOverlay cardBackground={theme.card} />}
      </View>
    </>
  );
}
