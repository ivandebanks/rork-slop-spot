import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles";

export function PreviewFrame({
  caption,
  subcaption,
  children,
}: {
  caption: string;
  subcaption: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.frameContainer}>
      <LinearGradient
        colors={["#0D3B66", "#118AB2"]}
        style={styles.frameGradient}
      >
        <View style={styles.captionArea}>
          <Text style={styles.captionText}>{caption}</Text>
          <Text style={styles.subcaptionText}>{subcaption}</Text>
        </View>
        {children}
      </LinearGradient>
    </View>
  );
}
