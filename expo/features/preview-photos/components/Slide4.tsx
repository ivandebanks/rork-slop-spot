import { ScrollView, Text, View } from "react-native";
import { ArrowLeft, Share2, Package, Info, ExternalLink } from "lucide-react-native";
import { PreviewFrame } from "./PreviewFrame";
import { styles } from "../styles";

// Slide 4: PRODUCT DETAILS
// Screenshot: Full result detail view
// Caption: "Detailed Health Reports with Sources"
export function Slide4() {
  return (
    <PreviewFrame caption="Detailed Health Reports" subcaption="With scientific citations for every rating">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#FFFFFF" }]}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Product image area */}
            <View style={styles.productImageArea}>
              <View style={styles.productImagePlaceholder}>
                <Package size={40} color="#AAAAAA" />
                <Text style={styles.productImageText}>Product Photo</Text>
              </View>
              <View style={styles.floatingBack}>
                <ArrowLeft size={18} color="#FFFFFF" />
              </View>
              <View style={styles.floatingShare}>
                <Share2 size={18} color="#FFFFFF" />
              </View>
            </View>

            {/* Result card */}
            <View style={styles.detailResultCard}>
              <View style={[styles.scoreCircleMock, { backgroundColor: "#E63946", width: 70, height: 70, borderRadius: 35 }]}>
                <Text style={[styles.scoreNumMock, { fontSize: 28 }]}>32</Text>
                <Text style={styles.scoreOfMock}>/100</Text>
              </View>
              <Text style={[styles.gradeLabelMock, { color: "#E63946" }]}>Slop</Text>
              <Text style={styles.productNameMock}>Mountain Dew Code Red</Text>

              {/* Ingredient detail */}
              <View style={styles.detailIngredient}>
                <View style={styles.ingHeader}>
                  <View style={styles.ingNameRow}>
                    <View style={[styles.ingDot, { backgroundColor: "#E63946" }]} />
                    <Text style={styles.ingName}>High Fructose Corn Syrup</Text>
                  </View>
                  <View style={[styles.ingBadge, { backgroundColor: "#E6394620" }]}>
                    <Text style={[styles.ingScore, { color: "#E63946" }]}>12</Text>
                  </View>
                </View>
                <Text style={styles.ingImpactBold}>Linked to obesity and metabolic disease</Text>
                <Text style={styles.ingExplanation}>
                  Highly processed sweetener associated with increased risk of type 2 diabetes, fatty liver disease, and cardiovascular issues.
                </Text>
                <View style={styles.citationBtn}>
                  <ExternalLink size={12} color="#118AB2" />
                  <Text style={styles.citationBtnText}>View Sources (3)</Text>
                </View>
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimerMock}>
                <Info size={14} color="#FFA500" />
                <Text style={styles.disclaimerText}>For entertainment purposes only. Not medical advice.</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </PreviewFrame>
  );
}
