import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Lock, ArrowUpRight } from "lucide-react-native";
import { styles } from "../styles";

export function PremiumBlurOverlay({ cardBackground }: { cardBackground: string }) {
  return (
    <View style={styles.blurOverlay}>
      <View style={[styles.blurBackground, { backgroundColor: cardBackground }]} />
      <TouchableOpacity
        style={styles.unlockButton}
        onPress={() => router.push("/paywall" as any)}
      >
        <Lock size={18} color="#D4AF37" />
        <Text style={styles.unlockText}>Unlock with Premium</Text>
        <ArrowUpRight size={14} color="#D4AF37" />
      </TouchableOpacity>
    </View>
  );
}
