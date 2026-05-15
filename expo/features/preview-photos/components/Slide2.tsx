import { ScrollView, Text, View } from "react-native";
import { PreviewFrame } from "./PreviewFrame";
import { styles } from "../styles";

// Slide 2: INGREDIENTS
// Screenshot: Result screen ingredient list
// Caption: "See Every Ingredient Rated"
export function Slide2() {
  const ingredients = [
    { name: "Organic Whole Oats", score: 95, color: "#118AB2", impact: "Excellent source of fiber" },
    { name: "Raw Honey", score: 78, color: "#06D6A0", impact: "Natural sweetener with antioxidants" },
    { name: "Sunflower Oil", score: 62, color: "#FCBF49", impact: "High in omega-6 fatty acids" },
    { name: "Natural Flavors", score: 45, color: "#F77F00", impact: "Vague labeling, unknown compounds" },
    { name: "Soy Lecithin", score: 58, color: "#FCBF49", impact: "Common emulsifier, generally safe" },
  ];

  return (
    <PreviewFrame caption="See Every Ingredient Rated" subcaption="AI-powered health scores from 0-100">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#FFFFFF" }]}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Result card */}
            <View style={styles.resultCardMock}>
              <View style={[styles.scoreCircleMock, { backgroundColor: "#06D6A0" }]}>
                <Text style={styles.scoreNumMock}>74</Text>
                <Text style={styles.scoreOfMock}>/100</Text>
              </View>
              <Text style={[styles.gradeLabelMock, { color: "#06D6A0" }]}>B Grade</Text>
              <Text style={styles.productNameMock}>Nature's Path Granola</Text>

              {/* Section title */}
              <View style={styles.sectionHeaderMock}>
                <Text style={styles.sectionTitleMock}>Ingredients (5)</Text>
              </View>

              {/* Ingredient cards */}
              {ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientCardMock}>
                  <View style={styles.ingHeader}>
                    <View style={styles.ingNameRow}>
                      <View style={[styles.ingDot, { backgroundColor: ing.color }]} />
                      <Text style={styles.ingName}>{ing.name}</Text>
                    </View>
                    <View style={[styles.ingBadge, { backgroundColor: ing.color + "20" }]}>
                      <Text style={[styles.ingScore, { color: ing.color }]}>{ing.score}</Text>
                    </View>
                  </View>
                  <Text style={styles.ingImpact}>{ing.impact}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </PreviewFrame>
  );
}
