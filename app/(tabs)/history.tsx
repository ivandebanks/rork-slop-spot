import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Platform } from "react-native";
import { useScans } from "@/contexts/ScanContext";
import { router } from "expo-router";
import { getGradeColor } from "@/types/scan";
import { Clock, ChevronRight, Package } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

export default function HistoryScreen() {
  const { scans, isLoading } = useScans();
  const { theme, scaleFont } = useTheme();

  const handleScanPress = (scanId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/result",
      params: { scanId },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>Loading...</Text>
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Package size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text, fontSize: scaleFont(24) }]}>No Scans Yet</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
          Start scanning products to see your history here
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const date = new Date(item.timestamp);
          const formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => handleScanPress(item.id)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
              <View style={styles.cardContent}>
                <Text style={[styles.productName, { color: theme.text, fontSize: scaleFont(16) }]} numberOfLines={1}>
                  {item.productName}
                </Text>
                <View style={styles.metadata}>
                  <Clock size={14} color={theme.textSecondary} />
                  <Text style={[styles.timestamp, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    {formattedDate} at {formattedTime}
                  </Text>
                </View>
                <View style={styles.ingredientCount}>
                  <Text style={[styles.ingredientCountText, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    {item.ingredients.length} ingredients
                  </Text>
                </View>
              </View>
              <View style={styles.scoreContainer}>
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: getGradeColor(item.overallScore) },
                  ]}
                >
                  <Text style={[styles.scoreText, { fontSize: scaleFont(18) }]}>{Math.round(item.overallScore)}</Text>
                </View>
                <Text
                  style={[
                    styles.gradeLabel,
                    { color: getGradeColor(item.overallScore), fontSize: scaleFont(11) },
                  ]}
                >
                  {item.gradeLabel}
                </Text>
                <ChevronRight size={20} color={theme.textSecondary} style={styles.chevron} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timestamp: {
    fontSize: 13,
  },
  ingredientCount: {
    marginTop: 2,
  },
  ingredientCountText: {
    fontSize: 13,
  },
  scoreContainer: {
    alignItems: "center",
    gap: 4,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  gradeLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  chevron: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
