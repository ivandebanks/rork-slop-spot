import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  Animated,
  Linking,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import ReAnimated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, Easing } from "react-native-reanimated";
import { Sparkles, FlipHorizontal, RotateCcw, Zap, ZapOff, ImageIcon } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { useScans } from "@/contexts/ScanContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import { router } from "expo-router";
import { getGradeLabel, ScanResult, CompanyOwnership, AlternativeSuggestion } from "@/types/scan";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { recordScanForNotifications } from "@/contexts/NotificationContext";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

const citationSchema = z.object({
  title: z.string(),
  url: z.string(),
  source: z.string(),
});

const ingredientSchema = z.object({
  name: z.string(),
  rating: z.number().min(0).max(100),
  healthImpact: z.string(),
  explanation: z.string(),
  citations: z.array(citationSchema).optional(),
});

const companyOwnershipSchema = z.object({
  company: z.string(),
  parentCompany: z.string().optional(),
  ultimateParent: z.string().optional(),
  reputationScore: z.number().min(0).max(100),
});

const alternativeSuggestionSchema = z.object({
  productName: z.string(),
  estimatedScore: z.number().min(0).max(100),
  reason: z.string(),
});

const analysisSchema = z.object({
  productName: z.string(),
  ingredients: z.array(ingredientSchema),
  overallScore: z.number().min(0).max(100),
  behindIt: companyOwnershipSchema.optional(),
  alternatives: z.array(alternativeSuggestionSchema).optional(),
});

const SCAN_COUNT_REVIEW_KEY = "@kiwi_scan_count_review";
const REVIEW_PROMPTED_KEY = "@kiwi_review_prompted";

async function maybePromptReview() {
  try {
    const prompted = await AsyncStorage.getItem(REVIEW_PROMPTED_KEY);
    if (prompted === "true") return;

    const countStr = await AsyncStorage.getItem(SCAN_COUNT_REVIEW_KEY);
    const count = (countStr ? parseInt(countStr, 10) : 0) + 1;
    await AsyncStorage.setItem(SCAN_COUNT_REVIEW_KEY, String(count));

    // Prompt after 3rd scan
    if (count >= 3 && (await StoreReview.isAvailableAsync())) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(REVIEW_PROMPTED_KEY, "true");
    }
  } catch {}
}

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const { addScan } = useScans();
  const { canScan, useScanMutation, scansRemaining } = usePurchases();
  const { theme, scaleFont } = useTheme();

  // Animation values
  const burstAnim = useRef(new Animated.Value(0)).current;
  const redFillAnim = useRef(new Animated.Value(0)).current;
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reanimated pulse for capture button
  const captureScale = useSharedValue(1);
  useEffect(() => {
    captureScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);
  const capturePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  useEffect(() => {
    if (analysisProgress >= 100) {
      Animated.parallel([
        Animated.spring(burstAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(redFillAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      burstAnim.setValue(0);
      redFillAnim.setValue(0);
    }
  }, [analysisProgress]);

  // Simulate progress when analyzing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnalyzing && analysisProgress < 85) {
      interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          // Smoother, smaller increments for better animation
          const increment = prev < 30 ? 1 : prev < 50 ? 0.8 : prev < 70 ? 0.5 : 0.2;
          return Math.min(prev + increment, 85);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, analysisProgress]);

  const analyzeMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      setIsAnalyzing(true);
      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                image: imageUri,
              },
              {
                type: "text",
                text: `Analyze this food/beverage/product label. Extract the product name and all ingredients.

For each ingredient:
1. Rate it from 0-100 based on health impact (100 = excellent, 0 = very harmful)
2. Provide a brief explanation of health impact
3. IMPORTANT: Include 1-3 scientific citations that support your health assessment. Citations must include:
   - title: A descriptive title of the source
   - url: A valid URL to a reputable source (FDA, NIH, WHO, PubMed, peer-reviewed journals, medical organizations)
   - source: The organization name (e.g., "FDA", "NIH", "WHO", "Mayo Clinic", "PubMed")

Then calculate an overall score (average of all ingredient ratings).

Also provide:
- behindIt: The company that makes this product. Include "company" (the brand/manufacturer), "parentCompany" (if owned by a larger company), "ultimateParent" (if there's a top-level conglomerate, e.g. Nestlé, PepsiCo, Unilever), and "reputationScore" (0-100, based on the company's track record with health, transparency, recalls, lawsuits, and ethical practices). Only include parent levels that exist.
- alternatives: 2-4 similar products in the same category that would score higher on health. For each, include "productName", "estimatedScore" (0-100), and "reason" (brief explanation of why it's healthier).

Ensure all health claims are backed by credible scientific sources.`,
              },
            ],
          },
        ],
        schema: analysisSchema,
      });

      const scanResult: ScanResult = {
        id: Date.now().toString(),
        productName: result.productName,
        imageUri,
        ingredients: result.ingredients,
        overallScore: result.overallScore,
        gradeLabel: getGradeLabel(result.overallScore),
        timestamp: Date.now(),
        behindIt: result.behindIt,
        alternatives: result.alternatives,
      };

      addScan(scanResult);
      recordScanForNotifications();
      maybePromptReview();
      return scanResult;
    },
    onSuccess: (data) => {
      // Smoothly animate from current progress to 100
      const completeInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(completeInterval);
            setIsAnalyzing(false);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            setTimeout(() => {
              router.push({
                pathname: "/result" as any,
                params: { scanId: data.id, isNewScan: "true" },
              });
              setCapturedPhoto(null);
              setAnalysisProgress(0);
            }, 2000);
            return 100;
          }
          return Math.min(prev + 3, 100);
        });
      }, 25);
    },
    onError: () => {
      setCapturedPhoto(null);
      setAnalysisProgress(0);
      setIsAnalyzing(false);
    },
  });

  const toggleFlash = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFlashEnabled(!flashEnabled);
  };

  const pickImageFromGallery = async () => {
    if (!canScan) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      router.push("/paywall" as any);
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setCapturedPhoto(imageUri);
      setAnalysisProgress(0);
      useScanMutation.mutate();
      analyzeMutation.mutate(imageUri);
    }
  };

  const takePicture = async () => {
    if (!canScan) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      router.push("/paywall" as any);
      return;
    }

    // Request permission if not granted
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result || !result.granted) {
        return; // User denied permission
      }
    }

    if (cameraRef && !isAnalyzing) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      if (photo && photo.base64) {
        const imageUri = `data:image/jpeg;base64,${photo.base64}`;
        setCapturedPhoto(imageUri);
        setAnalysisProgress(0);
        useScanMutation.mutate();
        analyzeMutation.mutate(imageUri);
      }
    }
  };

  const retakePhoto = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCapturedPhoto(null);
    setAnalysisProgress(0);
    analyzeMutation.reset();
  };

  const toggleCameraFacing = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!permission?.granted && !capturedPhoto ? (
        <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
          <Sparkles size={48} color={theme.primary} />
          <Text style={[styles.permissionTitle, { color: theme.text, fontSize: scaleFont(24) }]}>
            Camera Access Needed
          </Text>
          <Text style={[styles.permissionText, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
            Kiwi needs camera access to scan product labels and ingredients for health analysis.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.primary }]}
            onPress={async () => {
              const result = await requestPermission();
              if (!result?.granted) {
                Linking.openSettings();
              }
            }}
          >
            <Text style={[styles.permissionButtonText, { fontSize: scaleFont(16) }]}>
              Enable Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.galleryFallbackButton}
            onPress={pickImageFromGallery}
          >
            <ImageIcon size={18} color={theme.textSecondary} />
            <Text style={[styles.galleryFallbackText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
              Or pick from gallery
            </Text>
          </TouchableOpacity>
        </View>
      ) : capturedPhoto ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={capturedPhoto} style={styles.photoPreview} contentFit="contain" transition={200} />
          
          <View style={styles.photoOverlay}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { fontSize: scaleFont(32) }]}>Analyzing...</Text>
            </View>

            <View style={styles.progressContainer}>
              {/* Plant Growing Animation */}
              <View style={styles.plantContainer}>
                {/* Pot */}
                <View style={styles.pot}>
                  <View style={styles.potRim} />
                </View>

                {/* Stem - grows from 0 to 100% (max 180px) */}
                <View style={[styles.stem, { height: Math.min(analysisProgress, 100) * 1.8 }]} />

                {/* Leaves - appear at different stages */}
                {analysisProgress > 20 && (
                  <View style={[styles.leafLeft, { 
                    opacity: Math.min((analysisProgress - 20) / 10, 1),
                    bottom: 50 + (Math.min(analysisProgress, 100) * 1.8 * 0.3)
                  }]} />
                )}
                {analysisProgress > 45 && (
                  <View style={[styles.leafRight, { 
                    opacity: Math.min((analysisProgress - 45) / 10, 1),
                    bottom: 50 + (Math.min(analysisProgress, 100) * 1.8 * 0.6)
                  }]} />
                )}
                
                {/* Flower Bud */}
                {analysisProgress > 60 && analysisProgress < 100 && (
                  <View style={[styles.flowerBud, {
                    bottom: 50 + (analysisProgress * 1.8) - 8,
                    transform: [{ scale: (analysisProgress - 60) / 30 }]
                  }]} />
                )}

                {/* Burst effect at 100% */}
                {analysisProgress >= 100 && (
                  <>
                    <Animated.View 
                      style={[
                        styles.redBurst, 
                        { 
                          transform: [
                            { scale: redFillAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 30] 
                              }) 
                            }
                          ],
                          opacity: redFillAnim.interpolate({
                            inputRange: [0, 0.2, 1],
                            outputRange: [0, 1, 1]
                          })
                        }
                      ]} 
                    />
                    <Animated.View style={[styles.burstContainer, { transform: [{ scale: burstAnim }] }]}>
                      <View style={styles.iconSplatContainer}>
                        <Image 
                          source={require('../../assets/images/icon.png')} 
                          style={styles.burstIcon}
                          resizeMode="contain"
                        />
                      </View>
                    </Animated.View>
                  </>
                )}
              </View>

              {/* Progress text */}
              <View style={styles.progressTextContainer}>
                <Text style={[styles.progressText, { fontSize: scaleFont(48) }]}>
                  {Math.round(analysisProgress)}%
                </Text>
                <Text style={[styles.progressLabel, { fontSize: scaleFont(14) }]}>
                  {analysisProgress >= 100 ? 'Complete!' : 'Scanning ingredients'}
                </Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${analysisProgress}%`,
                      backgroundColor: analysisProgress >= 100 ? '#06D6A0' : '#118AB2'
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.retakeButtonContainer}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={retakePhoto}
                disabled={analyzeMutation.isPending}
              >
                <RotateCcw size={24} color="#FFFFFF" />
                <Text style={[styles.retakeButtonText, { fontSize: scaleFont(16) }]}>
                  Retake
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={setCameraRef}
          flash={flashEnabled ? "on" : "off"}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <View style={styles.headerLeft} />

              <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { fontSize: scaleFont(32) }]}>Kiwi</Text>
                <Text style={[styles.headerSubtitle, { fontSize: scaleFont(16) }]}>{scansRemaining} scans</Text>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={toggleFlash}
                >
                  {flashEnabled ? (
                    <Zap size={24} color="#FFD700" fill="#FFD700" />
                  ) : (
                    <ZapOff size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={pickImageFromGallery}
              >
                <ImageIcon size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <ReAnimated.View style={capturePulseStyle}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner}>
                    <Sparkles size={32} color="#118AB2" />
                  </View>
                </TouchableOpacity>
              </ReAnimated.View>

              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <FlipHorizontal size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  galleryFallbackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 12,
  },
  galleryFallbackText: {
    fontWeight: "500" as const,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 4,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconButton: {
    padding: 4,
  },
  scanFrame: {
    flex: 1,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  flipButton: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#118AB2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  captureButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPreviewContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  photoPreview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "space-between",
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  plantContainer: {
    width: 200,
    height: 300,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  pot: {
    width: 80,
    height: 60,
    backgroundColor: "#8B4513",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: "absolute",
    bottom: 0,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  potRim: {
    width: 90,
    height: 15,
    backgroundColor: "#A0522D",
    borderRadius: 10,
    position: "absolute",
    top: -8,
    left: -5,
  },
  stem: {
    width: 8,
    backgroundColor: "#2D5016",
    borderRadius: 4,
    position: "absolute",
    bottom: 50,
    zIndex: 1,
    shadowColor: "#2D5016",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  leafLeft: {
    width: 30,
    height: 20,
    backgroundColor: "#4A7C2E",
    borderRadius: 15,
    position: "absolute",
    left: 85,
    transform: [{ rotate: "-30deg" }],
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  leafRight: {
    width: 30,
    height: 20,
    backgroundColor: "#4A7C2E",
    borderRadius: 15,
    position: "absolute",
    right: 85,
    transform: [{ rotate: "30deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  flowerBud: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E63946",
    position: "absolute",
    zIndex: 3,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  redBurst: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E63946",
    bottom: 155,
    zIndex: 9,
  },
  burstContainer: {
    position: "absolute",
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    bottom: 130,
    zIndex: 10,
  },
  iconSplatContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  burstIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  progressTextContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  progressText: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#118AB2",
    borderRadius: 4,
    shadowColor: "#118AB2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  retakeButtonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 120,
    alignItems: "center",
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  retakeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});