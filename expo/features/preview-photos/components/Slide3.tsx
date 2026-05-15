import { Text, View } from "react-native";
import { Camera, Zap, BookOpen, Clock, Sparkles, Star } from "lucide-react-native";
import { PreviewFrame } from "./PreviewFrame";
import { styles } from "../styles";

// Slide 3: BENEFITS
// Screenshot: Key features showcase
// Caption: "Everything You Need to Eat Smarter"
export function Slide3() {
  const benefits = [
    { icon: <Camera size={24} color="#118AB2" />, title: "Instant Scan", desc: "Just point your camera at any label" },
    { icon: <Zap size={24} color="#F77F00" />, title: "AI Analysis", desc: "Health scores 0-100 per ingredient" },
    { icon: <BookOpen size={24} color="#06D6A0" />, title: "Real Sources", desc: "FDA, NIH & peer-reviewed citations" },
    { icon: <Clock size={24} color="#9B59B6" />, title: "Track History", desc: "Save every scan, compare products" },
  ];

  return (
    <PreviewFrame caption="Everything You Need to Eat Smarter" subcaption="Powerful features, dead simple to use">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#0A1628" }]}>
          <View style={styles.benefitsLayout}>
            <View style={styles.benefitsHeader}>
              <Sparkles size={28} color="#FFD700" />
              <Text style={styles.benefitsTitle}>Why Kiwi?</Text>
            </View>

            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRowMock}>
                <View style={styles.benefitIconBox}>{b.icon}</View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitleMock}>{b.title}</Text>
                  <Text style={styles.benefitDescMock}>{b.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.benefitsBadge}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.benefitsBadgeText}>Free to download  •  No account needed</Text>
            </View>
          </View>
        </View>
      </View>
    </PreviewFrame>
  );
}
