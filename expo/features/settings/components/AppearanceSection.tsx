import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { ThemeMode } from "../types";
import { styles } from "../styles";

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light Mode" },
  { value: "dark", label: "Dark Mode" },
  { value: "system", label: "System Preferences" },
];

export function AppearanceSection({
  themeMode,
  changeThemeMode,
  theme,
  scaleFont,
}: {
  themeMode: ThemeMode;
  changeThemeMode: (mode: ThemeMode) => void;
  theme: { text: string; textSecondary: string; primary: string; border: string; card: string };
  scaleFont: (n: number) => number;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
        APPEARANCE
      </Text>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {themeOptions.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              index !== themeOptions.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              },
            ]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              changeThemeMode(option.value);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
              {option.label}
            </Text>
            {themeMode === option.value && (
              <View
                style={[
                  styles.checkContainer,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
