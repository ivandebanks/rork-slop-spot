import { ScrollView, Text, View } from "react-native";
import { Search, SlidersHorizontal, ArrowUpDown, Package, Clock, ChevronRight } from "lucide-react-native";
import { PreviewFrame } from "./PreviewFrame";
import { styles } from "../styles";

// Slide 5: LIFESTYLE
// Screenshot: History screen with scans
// Caption: "Track Everything You Eat"
export function Slide5() {
  const scans = [
    { name: "Organic Granola Bar", score: 82, color: "#06D6A0", grade: "B Grade", time: "Today", count: 8 },
    { name: "Coca-Cola Classic", score: 18, color: "#E63946", grade: "Health Hazard", time: "Today", count: 12 },
    { name: "Greek Yogurt", score: 91, color: "#118AB2", grade: "A Grade", time: "Yesterday", count: 6 },
    { name: "Doritos Nacho Cheese", score: 28, color: "#E63946", grade: "Health Hazard", time: "Yesterday", count: 15 },
    { name: "Kind Protein Bar", score: 65, color: "#FCBF49", grade: "Premium Slop", time: "Mar 5", count: 10 },
  ];

  return (
    <PreviewFrame caption="Track Everything You Scan" subcaption="Build a history of smarter choices">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#FFFFFF" }]}>
          {/* History header */}
          <View style={styles.historyHeader}>
            <View style={styles.histSearchBar}>
              <Search size={16} color="#999" />
              <Text style={styles.histSearchText}>Search products...</Text>
            </View>
            <View style={styles.histFilterRow}>
              <View style={styles.histFilterBtn}>
                <SlidersHorizontal size={14} color="#1A1A1A" />
                <Text style={styles.histFilterText}>Filters</Text>
              </View>
              <View style={styles.histFilterBtn}>
                <ArrowUpDown size={14} color="#1A1A1A" />
                <Text style={styles.histFilterText}>Newest</Text>
              </View>
            </View>
            <Text style={styles.histCount}>{scans.length} scans</Text>
          </View>

          {/* Scan list */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.histList}>
              {scans.map((scan, i) => (
                <View key={i} style={[styles.histCard, { borderLeftColor: scan.color }]}>
                  <View style={styles.histThumb}>
                    <Package size={20} color="#CCC" />
                  </View>
                  <View style={styles.histCardContent}>
                    <Text style={styles.histProductName} numberOfLines={1}>{scan.name}</Text>
                    <View style={styles.histMeta}>
                      <Clock size={11} color="#999" />
                      <Text style={styles.histTime}>{scan.time}</Text>
                    </View>
                    <Text style={styles.histIngCount}>{scan.count} ingredients</Text>
                  </View>
                  <View style={styles.histScoreArea}>
                    <View style={[styles.histScoreBadge, { backgroundColor: scan.color }]}>
                      <Text style={styles.histScoreText}>{scan.score}</Text>
                    </View>
                    <Text style={[styles.histGrade, { color: scan.color }]}>{scan.grade}</Text>
                    <ChevronRight size={14} color="#CCC" />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </PreviewFrame>
  );
}
