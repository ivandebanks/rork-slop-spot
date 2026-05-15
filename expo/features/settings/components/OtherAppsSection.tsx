import { Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { ExternalLink } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { OTHER_APPS } from "../constants/apps";
import { styles } from "../styles";

export function OtherAppsSection({
  theme,
  scaleFont,
}: {
  theme: { text: string; textSecondary: string; border: string; card: string };
  scaleFont: (n: number) => number;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
        OUR OTHER APPS
      </Text>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {OTHER_APPS.map((app, index) => (
          <TouchableOpacity
            key={app.id}
            style={[
              styles.legalOption,
              index !== OTHER_APPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Linking.openURL(`https://apps.apple.com/app/id${app.id}`);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.legalOptionLeft}>
              <Image source={app.icon} style={styles.appIconImage} contentFit="cover" transition={200} />
              <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(15) }]}>
                {app.name}
              </Text>
            </View>
            <ExternalLink size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
