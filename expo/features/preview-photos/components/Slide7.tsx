import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Leaf } from "lucide-react-native";
import { PreviewFrame } from "./PreviewFrame";
import { styles } from "../styles";

// Slide 7: BRAND STORY
// Screenshot: Brand / download CTA
// Caption: "Know What You're Eating"
export function Slide7() {
  return (
    <PreviewFrame caption="Know What You're Eating" subcaption="Join thousands making healthier choices">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#0D3B66" }]}>
          <LinearGradient
            colors={["#0D3B66", "#118AB2", "#06D6A0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            <View style={styles.brandLayout}>
              <Image
                source={require("../../../assets/images/icon.png")}
                style={styles.brandLogoMock}
                resizeMode="contain"
              />
              <Text style={styles.brandNameMock}>Kiwi</Text>
              <Text style={styles.brandTaglineMock}>Better Health Scanner</Text>

              <View style={styles.brandMissionBox}>
                <Leaf size={16} color="#06D6A0" />
                <Text style={styles.brandMissionMock}>
                  Everyone deserves to know what's in their food. Scan, learn, and choose better.
                </Text>
              </View>

              <View style={styles.brandValuesList}>
                {[
                  { dot: "#06D6A0", text: "Transparency First" },
                  { dot: "#FFFFFF", text: "Privacy by Design" },
                  { dot: "#FFD700", text: "Science-Backed Ratings" },
                  { dot: "#9B59B6", text: "Accessible to Everyone" },
                ].map((v, i) => (
                  <View key={i} style={styles.brandValueRow}>
                    <View style={[styles.brandDot, { backgroundColor: v.dot }]} />
                    <Text style={styles.brandValueText}>{v.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.brandCtaMock}>
                <Text style={styles.brandCtaText}>Download Free</Text>
              </View>
              <Text style={styles.brandPriceLine}>Free  •  Premium $4.99 one-time</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </PreviewFrame>
  );
}
