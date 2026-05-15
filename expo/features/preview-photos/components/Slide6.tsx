import { Text, View } from "react-native";
import { Lock, BookOpen, Eye, Users, Shield, Check, Star } from "lucide-react-native";
import { PreviewFrame } from "./PreviewFrame";
import { styles } from "../styles";

// Slide 6: TRUST
// Screenshot: Privacy & trust signals
// Caption: "Your Privacy Comes First"
export function Slide6() {
  const trustPoints = [
    { icon: <Lock size={22} color="#118AB2" />, title: "100% On-Device", desc: "Photos never leave your phone" },
    { icon: <BookOpen size={22} color="#06D6A0" />, title: "Real Citations", desc: "FDA, NIH, WHO & PubMed sources" },
    { icon: <Eye size={22} color="#9B59B6" />, title: "Full Transparency", desc: "See why each score was given" },
    { icon: <Users size={22} color="#F77F00" />, title: "No Account Needed", desc: "Download and start scanning" },
  ];

  return (
    <PreviewFrame caption="Your Privacy Comes First" subcaption="No data leaves your device. Ever.">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#F0FDF4" }]}>
          <View style={styles.trustLayout}>
            <View style={styles.trustShieldWrap}>
              <Shield size={48} color="#06D6A0" />
            </View>

            {trustPoints.map((tp, i) => (
              <View key={i} style={styles.trustRowMock}>
                <View style={styles.trustIconBox}>{tp.icon}</View>
                <View style={styles.trustTextBox}>
                  <Text style={styles.trustTitleMock}>{tp.title}</Text>
                  <Text style={styles.trustDescMock}>{tp.desc}</Text>
                </View>
                <Check size={18} color="#06D6A0" />
              </View>
            ))}

            <View style={styles.trustRatingRow}>
              {[1, 2, 3, 4].map(i => (
                <Star key={i} size={20} color="#FFD700" fill="#FFD700" />
              ))}
              <Star size={20} color="#FFD700" />
              <Text style={styles.trustRatingText}>4.0 on App Store</Text>
            </View>

            <View style={styles.trustQuote}>
              <Text style={styles.trustQuoteText}>
                "Finally an app that tells me what's actually in my food without selling my data."
              </Text>
            </View>
          </View>
        </View>
      </View>
    </PreviewFrame>
  );
}
