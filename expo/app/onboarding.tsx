import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAnalytics, AnalyticsEvents } from "@/contexts/AnalyticsContext";

const TUTORIAL_KEY = "@slop_spot_tutorial_completed";
const { width } = Dimensions.get("window");

const STEPS = [
  {
    emoji: "\u26A0\uFE0F",
    title: "Do You Really Know\nWhat\u2019s In Your Food?",
    description:
      "73% of products labeled \u2018natural\u2019 or \u2018healthy\u2019 contain ingredients linked to health concerns.",
  },
  {
    emoji: "\uD83D\uDD2C",
    title: "Labels Are Designed\nto Confuse You",
    description:
      "Companies hide harmful ingredients behind scientific names most people can\u2019t pronounce \u2014 let alone research.",
  },
  {
    emoji: "\uD83D\uDCF8",
    title: "One Scan.\nThe Full Truth.",
    description:
      "Point your camera at any label. In seconds, get a health score for every ingredient \u2014 backed by FDA, NIH, and WHO research.",
    image:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5lwra13123vx6zrqzy6zp",
  },
  {
    emoji: "\uD83D\uDE31",
    title: "See What Others\nAre Finding",
    description:
      "Users scan an average of 4 products per shopping trip. Most are shocked by what they find \u2014 even in products they\u2019ve bought for years.",
    image:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/m5ufizp4beycm4pnv0xy3",
  },
  {
    emoji: "\u2B50",
    title: "Trusted by 25,000+\nFamilies",
    description:
      "\u201CI scanned my kids\u2019 favorite cereal and found 3 ingredients rated \u2018Avoid.\u2019 Switched brands the same day.\u201D \u2014 Sarah M.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme, scaleFont } = useTheme();
  const { track } = useAnalytics();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    track(AnalyticsEvents.ONBOARDING_STARTED);
  }, []);

  const complete = useCallback(async () => {
    track(AnalyticsEvents.ONBOARDING_COMPLETED, { steps_viewed: currentIndex + 1 });
    await AsyncStorage.setItem(TUTORIAL_KEY, "true");
    router.replace("/paywall");
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      complete();
    }
  }, [currentIndex, complete]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = useCallback(
    ({ item }: { item: (typeof STEPS)[number] }) => (
      <View style={[styles.slide, { width }]}>
        {item.image ? (
          <Image
            source={item.image}
            style={styles.slideImage}
            contentFit="contain"
            transition={300}
          />
        ) : (
          <Text style={styles.emoji}>{item.emoji}</Text>
        )}
        <Text style={[styles.title, { color: theme.text, fontSize: scaleFont(28) }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.description, { color: theme.textSecondary, fontSize: scaleFont(16) }]}
        >
          {item.description}
        </Text>
      </View>
    ),
    [theme, scaleFont],
  );

  const isLast = currentIndex === STEPS.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipButton} onPress={() => { track(AnalyticsEvents.ONBOARDING_SKIPPED, { skipped_at_step: currentIndex }); complete(); }}>
        <Text style={[styles.skipText, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
          Skip
        </Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={STEPS}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? theme.primary : theme.border,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: theme.primary }]}
          onPress={goNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctaText, { fontSize: scaleFont(17) }]}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontWeight: "600",
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  slideImage: {
    width: width * 0.75,
    height: 280,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
