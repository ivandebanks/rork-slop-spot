import { Platform, Switch, Text, TouchableOpacity, View } from "react-native";
import { Accessibility, ChevronDown, ChevronRight, Type } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { styles } from "../styles";

type TextSizeMode = "normal" | "medium" | "large" | "extraLarge";

export function AccessibilitySection({
  textSizeMode,
  changeTextSizeMode,
  accessibilityExpanded,
  toggleAccessibility,
  theme,
  scaleFont,
}: {
  textSizeMode: TextSizeMode;
  changeTextSizeMode: (mode: TextSizeMode) => void;
  accessibilityExpanded: boolean;
  toggleAccessibility: () => void;
  theme: { text: string; textSecondary: string; primary: string; border: string; card: string };
  scaleFont: (n: number) => number;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
        ACCESSIBILITY
      </Text>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={styles.accessibilityToggle}
          onPress={toggleAccessibility}
          activeOpacity={0.7}
        >
          <View style={styles.legalOptionLeft}>
            <Accessibility size={20} color={theme.primary} />
            <View style={styles.switchOptionText}>
              <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                Text Size
              </Text>
              {textSizeMode !== "normal" && (
                <Text style={[styles.optionDescription, { color: theme.primary, fontSize: scaleFont(12) }]}>
                  {textSizeMode === "medium" ? "Medium" : textSizeMode === "large" ? "Large" : "Extra Large"} active
                </Text>
              )}
            </View>
          </View>
          {accessibilityExpanded ? (
            <ChevronDown size={20} color={theme.textSecondary} />
          ) : (
            <ChevronRight size={20} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        {accessibilityExpanded && (
          <>
            <View style={[styles.switchOption, { borderTopWidth: 1, borderTopColor: theme.border, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={styles.switchOptionLeft}>
                <Type size={18} color={theme.primary} />
                <View style={styles.switchOptionText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Medium Text Mode
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    Increases all font sizes by 1.25x
                  </Text>
                </View>
              </View>
              <Switch
                value={textSizeMode === "medium"}
                onValueChange={(value) => {
                  if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                  changeTextSizeMode(value ? "medium" : "normal");
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.switchOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={styles.switchOptionLeft}>
                <Type size={20} color={theme.primary} strokeWidth={2} />
                <View style={styles.switchOptionText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Large Text Mode
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    Increases all font sizes by 1.5x
                  </Text>
                </View>
              </View>
              <Switch
                value={textSizeMode === "large"}
                onValueChange={(value) => {
                  if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                  changeTextSizeMode(value ? "large" : "normal");
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.switchOption}>
              <View style={styles.switchOptionLeft}>
                <Type size={24} color={theme.primary} strokeWidth={2.5} />
                <View style={styles.switchOptionText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Extra Large Text Mode
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    Increases all font sizes by 2x
                  </Text>
                </View>
              </View>
              <Switch
                value={textSizeMode === "extraLarge"}
                onValueChange={(value) => {
                  if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                  changeTextSizeMode(value ? "extraLarge" : "normal");
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
