import { Text, View } from "react-native";
import { HelpCircle, ZapOff, ImageIcon, Sparkles, FlipHorizontal } from "lucide-react-native";
import { PreviewFrame } from "./PreviewFrame";
import { styles } from "../styles";

// Slide 1: CLICK IMAGE (Hero)
// Screenshot: Camera scanner screen
// Caption: "Scan Any Label Instantly"
export function Slide1() {
  return (
    <PreviewFrame caption="Scan Any Label Instantly" subcaption="Point your camera at any food or product">
      <View style={styles.phoneScreen}>
        {/* Camera screen mockup */}
        <View style={[styles.mockScreen, { backgroundColor: "#1A1A1A" }]}>
          {/* Camera overlay */}
          <View style={styles.cameraOverlay}>
            {/* Header */}
            <View style={styles.camHeader}>
              <View style={styles.camHeaderLeft}>
                <HelpCircle size={20} color="#FFFFFF" />
              </View>
              <View style={styles.camHeaderCenter}>
                <Text style={styles.camTitle}>Kiwi</Text>
                <Text style={styles.camSubtitle}>2 scans</Text>
              </View>
              <View style={styles.camHeaderRight}>
                <ZapOff size={20} color="#FFFFFF" />
              </View>
            </View>

            {/* Scan frame */}
            <View style={styles.camScanFrame} />

            {/* Controls */}
            <View style={styles.camControls}>
              <View style={styles.camSideBtn}>
                <ImageIcon size={22} color="#FFFFFF" />
              </View>
              <View style={styles.camCaptureBtn}>
                <View style={styles.camCaptureBtnInner}>
                  <Sparkles size={24} color="#118AB2" />
                </View>
              </View>
              <View style={styles.camSideBtn}>
                <FlipHorizontal size={22} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </PreviewFrame>
  );
}
