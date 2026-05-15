import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { slides } from "@/features/preview-photos/slides";
import { styles } from "@/features/preview-photos/styles";
import { PREVIEW_SCREEN_WIDTH } from "@/features/preview-photos/constants";

export default function PreviewPhotosScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Preview Photos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={PREVIEW_SCREEN_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={[styles.slideWrapper, { width: PREVIEW_SCREEN_WIDTH }]}>
            <Text style={styles.slideLabel}>{slide.label}</Text>
            <slide.component />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
