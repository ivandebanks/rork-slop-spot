import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Platform, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScans } from "@/contexts/ScanContext";
import { router } from "expo-router";
import { getGradeColor } from "@/types/scan";
import { Clock, ChevronRight, Package, Search, SlidersHorizontal, X, Trash2, Star, ArrowUpDown, CheckSquare, Square } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useMemo } from "react";
import { Swipeable } from "react-native-gesture-handler";

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type DateFilter = "all" | "today" | "week" | "month";

export default function HistoryScreen() {
  const { scans, isLoading, deleteScan, toggleFavorite, clearAllScans } = useScans();
  const { theme, scaleFont } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [gradeFilter, setGradeFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const grades = ["A+", "A", "B", "C", "D", "F"];

  const handleScanPress = (scanId: string) => {
    if (selectMode) {
      toggleSelection(scanId);
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/result",
      params: { scanId },
    });
  };

  const handleLongPress = (scanId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectMode(true);
    setSelectedItems(new Set([scanId]));
  };

  const toggleSelection = (scanId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scanId)) {
        newSet.delete(scanId);
      } else {
        newSet.add(scanId);
      }
      return newSet;
    });
  };

  const cancelSelectMode = () => {
    setSelectMode(false);
    setSelectedItems(new Set());
  };

  const selectAll = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const allIds = new Set(filteredAndSortedScans.map(scan => scan.id));
    setSelectedItems(allIds);
  };

  const deleteSelected = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    selectedItems.forEach(id => deleteScan(id));
    cancelSelectMode();
  };

  const handleDelete = (scanId: string) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    deleteScan(scanId);
  };

  const handleFavorite = (scanId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(scanId);
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    clearAllScans();
    setShowClearConfirm(false);
  };

  const toggleGradeFilter = (grade: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setGradeFilter(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const cycleSortOption = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const options: SortOption[] = ["newest", "oldest", "highest", "lowest"];
    const currentIndex = options.indexOf(sortBy);
    setSortBy(options[(currentIndex + 1) % options.length]);
  };

  const filteredAndSortedScans = useMemo(() => {
    let filtered = [...scans];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(scan => 
        scan.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Grade filter
    if (gradeFilter.length > 0) {
      filtered = filtered.filter(scan => gradeFilter.includes(scan.gradeLabel));
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      filtered = filtered.filter(scan => {
        const diff = now - scan.timestamp;
        switch (dateFilter) {
          case "today":
            return diff < day;
          case "week":
            return diff < 7 * day;
          case "month":
            return diff < 30 * day;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp - a.timestamp;
        case "oldest":
          return a.timestamp - b.timestamp;
        case "highest":
          return b.overallScore - a.overallScore;
        case "lowest":
          return a.overallScore - b.overallScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [scans, searchQuery, gradeFilter, dateFilter, sortBy]);

  const renderRightActions = (scanId: string, isFavorite: boolean) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeButton, styles.favoriteButton]}
          onPress={() => handleFavorite(scanId)}
        >
          <Star size={24} color="#FFFFFF" fill={isFavorite ? "#FFFFFF" : "none"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeButton, styles.deleteButton]}
          onPress={() => handleDelete(scanId)}
        >
          <Trash2 size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case "newest": return "Newest First";
      case "oldest": return "Oldest First";
      case "highest": return "Highest Score";
      case "lowest": return "Lowest Score";
    }
  };

  if (scans.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Package size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text, fontSize: scaleFont(24) }]}>No Scans Yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
            Start scanning products to see your history here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header Controls */}
      <View style={[styles.controls, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text, fontSize: scaleFont(16) }]}
            placeholder="Search products..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter & Sort Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.card }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={18} color={theme.text} />
            <Text style={[styles.filterButtonText, { color: theme.text, fontSize: scaleFont(14) }]}>
              Filters
            </Text>
            {(gradeFilter.length > 0 || dateFilter !== "all") && (
              <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.filterBadgeText, { fontSize: scaleFont(10) }]}>
                  {gradeFilter.length + (dateFilter !== "all" ? 1 : 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.card }]}
            onPress={cycleSortOption}
          >
            <ArrowUpDown size={18} color={theme.text} />
            <Text style={[styles.filterButtonText, { color: theme.text, fontSize: scaleFont(14) }]}>
              {getSortLabel()}
            </Text>
          </TouchableOpacity>

          {scans.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.card }]}
              onPress={handleClearAll}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filterOptions}>
            {/* Grade Filters */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: theme.text, fontSize: scaleFont(13) }]}>
                Grade
              </Text>
              <View style={styles.gradeChips}>
                {grades.map(grade => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeChip,
                      { 
                        backgroundColor: gradeFilter.includes(grade) ? getGradeColor(grade === "A+" ? 95 : grade === "A" ? 85 : grade === "B" ? 75 : grade === "C" ? 65 : grade === "D" ? 55 : 45) : theme.card,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => toggleGradeFilter(grade)}
                  >
                    <Text style={[
                      styles.gradeChipText,
                      { 
                        color: gradeFilter.includes(grade) ? "#FFFFFF" : theme.text,
                        fontSize: scaleFont(13),
                      }
                    ]}>
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Filters */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: theme.text, fontSize: scaleFont(13) }]}>
                Date
              </Text>
              <View style={styles.dateChips}>
                {[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dateChip,
                      { 
                        backgroundColor: dateFilter === option.value ? theme.primary : theme.card,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setDateFilter(option.value as DateFilter);
                    }}
                  >
                    <Text style={[
                      styles.dateChipText,
                      { 
                        color: dateFilter === option.value ? "#FFFFFF" : theme.text,
                        fontSize: scaleFont(13),
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Select Mode Header */}
      {selectMode && (
        <View style={[styles.selectModeHeader, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={cancelSelectMode} style={styles.selectModeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.selectModeCenter}>
            <Text style={[styles.selectModeText, { fontSize: scaleFont(16) }]}>
              {selectedItems.size} selected
            </Text>
            <TouchableOpacity onPress={selectAll} style={styles.selectAllButton}>
              <Text style={[styles.selectAllText, { fontSize: scaleFont(13) }]}>
                Select All
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={deleteSelected} disabled={selectedItems.size === 0} style={styles.selectModeButton}>
            <Trash2 size={24} color={selectedItems.size > 0 ? "#FFFFFF" : "rgba(255,255,255,0.5)"} />
          </TouchableOpacity>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={[styles.resultsCountText, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
          {filteredAndSortedScans.length} {filteredAndSortedScans.length === 1 ? "scan" : "scans"}
        </Text>
      </View>

      {/* Scan List */}
      {filteredAndSortedScans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Search size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text, fontSize: scaleFont(24) }]}>No Results</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
            Try adjusting your filters or search query
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedScans}
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

            const isSelected = selectedItems.has(item.id);

            return (
              <Swipeable
                renderRightActions={() => renderRightActions(item.id, item.isFavorite || false)}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    { 
                      backgroundColor: theme.card,
                      borderLeftWidth: 4,
                      borderLeftColor: getGradeColor(item.overallScore),
                    }
                  ]}
                  onPress={() => handleScanPress(item.id)}
                  onLongPress={() => handleLongPress(item.id)}
                  activeOpacity={0.7}
                >
                  {selectMode && (
                    <View style={styles.checkbox}>
                      {isSelected ? (
                        <CheckSquare size={24} color={theme.primary} />
                      ) : (
                        <Square size={24} color={theme.textSecondary} />
                      )}
                    </View>
                  )}

                  <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
                  
                  <View style={styles.cardContent}>
                    <View style={styles.productNameRow}>
                      <Text style={[styles.productName, { color: theme.text, fontSize: scaleFont(16) }]} numberOfLines={1}>
                        {item.productName}
                      </Text>
                      {item.isFavorite && (
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                      )}
                    </View>
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
                    {!selectMode && (
                      <ChevronRight size={20} color={theme.textSecondary} style={styles.chevron} />
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
        />
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        visible={showClearConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: scaleFont(20) }]}>
              Clear All Scans?
            </Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
              This will permanently delete all {scans.length} scans from your history. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.background }]}
                onPress={() => setShowClearConfirm(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text, fontSize: scaleFont(16) }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmClearAll}
              >
                <Text style={[styles.confirmButtonText, { fontSize: scaleFont(16) }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  filterBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterOptions: {
    gap: 16,
    paddingTop: 8,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  gradeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gradeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  gradeChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  dateChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  selectModeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectModeButton: {
    padding: 4,
  },
  selectModeCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  selectModeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  selectAllText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500" as const,
    opacity: 0.9,
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 13,
  },
  list: {
    padding: 16,
    paddingTop: 8,
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
  checkbox: {
    marginRight: 12,
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
  productNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productName: {
    flex: 1,
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
  swipeActions: {
    flexDirection: "row",
    marginVertical: 12,
  },
  swipeButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderRadius: 12,
  },
  favoriteButton: {
    backgroundColor: "#FFD700",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  confirmButton: {
    backgroundColor: "#EF4444",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});