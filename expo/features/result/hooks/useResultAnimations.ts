import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Platform } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing as REasing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { ScanResult } from "@/types/scan";

export function useResultAnimations(scan: ScanResult | undefined, isNewScan?: string) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Staggered entrance animations
  const scoreOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0.5);
  const productOpacity = useSharedValue(0);
  const productTranslateY = useSharedValue(20);
  const ingredientsOpacity = useSharedValue(0);
  const ingredientsTranslateY = useSharedValue(20);
  const premiumOpacity = useSharedValue(0);
  const premiumTranslateY = useSharedValue(20);

  // Score counting animation
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Only animate if it's a new scan
    if (isNewScan !== "true") return;

    // Start with a small delay to ensure the user sees the red screen
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get("window").height,
        duration: 2500, // Slow drip
        useNativeDriver: true,
        easing: Easing.in(Easing.exp), // Accelerate downwards like a drip
      }).start();
    }, 1000);
    return () => clearTimeout(timer);
  }, [isNewScan]);

  useEffect(() => {
    // Haptic on results load
    if (scan && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Staggered entrance
    const delay = isNewScan === "true" ? 3200 : 200;
    scoreOpacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    scoreScale.value = withDelay(delay, withTiming(1, { duration: 600, easing: REasing.out(REasing.back(1.5)) }));
    productOpacity.value = withDelay(delay + 200, withTiming(1, { duration: 500 }));
    productTranslateY.value = withDelay(delay + 200, withTiming(0, { duration: 500 }));
    ingredientsOpacity.value = withDelay(delay + 400, withTiming(1, { duration: 500 }));
    ingredientsTranslateY.value = withDelay(delay + 400, withTiming(0, { duration: 500 }));
    premiumOpacity.value = withDelay(delay + 600, withTiming(1, { duration: 500 }));
    premiumTranslateY.value = withDelay(delay + 600, withTiming(0, { duration: 500 }));

    // Score counting animation
    if (scan) {
      const target = Math.round(scan.overallScore);
      const startDelay = isNewScan === "true" ? 3400 : 400;
      const counterTimer = setTimeout(() => {
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          setDisplayScore(current);
          if (current >= target) clearInterval(interval);
        }, 30);
      }, startDelay);
      return () => clearTimeout(counterTimer);
    }
  }, [scan?.id]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));
  const productAnimStyle = useAnimatedStyle(() => ({
    opacity: productOpacity.value,
    transform: [{ translateY: productTranslateY.value }],
  }));
  const ingredientsAnimStyle = useAnimatedStyle(() => ({
    opacity: ingredientsOpacity.value,
    transform: [{ translateY: ingredientsTranslateY.value }],
  }));
  const premiumAnimStyle = useAnimatedStyle(() => ({
    opacity: premiumOpacity.value,
    transform: [{ translateY: premiumTranslateY.value }],
  }));

  return {
    slideAnim,
    displayScore,
    scoreAnimStyle,
    productAnimStyle,
    ingredientsAnimStyle,
    premiumAnimStyle,
  };
}
