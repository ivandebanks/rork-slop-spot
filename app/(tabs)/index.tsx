import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  Image,
  Animated,
  Linking,
  Dimensions,
  PanResponder,
} from "react-native";
import { Camera, Sparkles, FlipHorizontal, X, RotateCcw, HelpCircle, Zap, ZapOff, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { useScans } from "@/contexts/ScanContext";
import { router } from "expo-router";
import { getGradeLabel, ScanResult } from "@/types/scan";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const TUTORIAL_KEY = "@slop_spot_tutorial_completed";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const analysisSchema = z.object({
  productName: z.string(),
  ingredients: z.array(ingredientSchema),
  overallScore: z.number().min(0).max(100),
});

const tutorialSteps = [
  {
    title: "Welcome to Slop Spot",
    description: "Scan any food, beverage, or product label to instantly analyze its ingredients and health impact.",
    icon: "✨",
    image: null,
  },
  {
    title: "Scan Food",
    description: "Point your camera at any food label to get detailed ingredient analysis and health ratings.",
    icon: "🍞",
    image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5lwra13123vx6zrqzy6zp",
  },
  {
    title: "Scan Drinks",
    description: "Analyze beverages to understand what's really in your drinks and make informed choices.",
    icon: "🥤",
    image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/m5ufizp4beycm4pnv0xy3",
  },
  {
    title: "Scan Products",
    description: "Check household and personal care products for ingredient safety and quality ratings.",
    icon: "🧴",
    image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hh0rm1tln46vaublx4hjd",
  },
  {
    title: "Track Your Scans",
    description: "View your scan history and compare products to make healthier choices.",
    icon: "📋",
    image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/gwbb9y93ep6lhc77n3j8k",
  },
  {
    title: "Rate Us",
    description: "Enjoying the app? Please leave a review on the App Store. It helps us a lot!",
    icon: "⭐",
    image: null,
  },
];

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const { addScan } = useScans();
  const { theme, scaleFont } = useTheme();

  // Animation values
  const burstAnim = useRef(new Animated.Value(0)).current;
  const redFillAnim = useRef(new Animated.Value(0)).current;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const swipeHintOpacity = useRef(new Animated.Value(1)).current;

  // Handler functions - must be declared before panResponder
  const animateToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep < tutorialSteps.length - 1) {
      animateToStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep > 0) {
      animateToStep(currentStep - 1);
    }
  };

  // PanResponder for swipe gestures - now handlers are defined
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const SWIPE_THRESHOLD = 50;
        
        if (gestureState.dx < -SWIPE_THRESHOLD && currentStep < tutorialSteps.length - 1) {
          // Swipe left - go to next step
          handleNext();
        } else if (gestureState.dx > SWIPE_THRESHOLD && currentStep > 0) {
          // Swipe right - go to previous step
          handlePrevious();
        }
      },
    })
  ).current;

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

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  // Animate swipe hint
  useEffect(() => {
    if (showTutorial && currentStep < tutorialSteps.length - 1) {
      // Reset and pulse the swipe hint
      swipeHintOpacity.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(swipeHintOpacity, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintOpacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showTutorial, currentStep]);

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

  const checkTutorialStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(TUTORIAL_KEY);
      if (!completed) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.log("Error checking tutorial status:", error);
    }
  };

  const completeTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_KEY, "true");
      setShowTutorial(false);
    } catch (error) {
      console.log("Error saving tutorial status:", error);
    }
  };

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
      };

      addScan(scanResult);
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
                pathname: "/result",
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

  const replayTutorial = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentStep(0);
    setShowTutorial(true);
  };

  const toggleFlash = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFlashEnabled(!flashEnabled);
  };

  const pickImageFromGallery = async () => {
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
      analyzeMutation.mutate(imageUri);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const takePicture = async () => {
    // Request permission if not granted
    if (permission && permission.granted) {
      // Permission already granted, take photo
    } else {
      // Request permission
      const result = await requestPermission();
      if (result && result.granted) {
        // Permission granted, continue
      } else {
        // User denied permission
        return;
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
        analyzeMutation.mutate(imageUri);
      }
    }
  };

  // Show tutorial first, before asking for camera permission
  if (showTutorial) {
    const step = tutorialSteps[currentStep];
    return (
      <View style={[styles.tutorialContainer, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <X size={24} color={theme.textSecondary} />
          </TouchableOpacity>

  const takePicture = async () => {
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
        // flash is controlled by the CameraView prop
      });
      if (photo && photo.base64) {
        const imageUri = `data:image/jpeg;base64,${photo.base64}`;
        setCapturedPhoto(imageUri);
        setAnalysisProgress(0);
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

  const handleSkip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    completeTutorial();
  };

  const handleRate = async () => {
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("https://apps.apple.com/app/id6757214914?action=write-review");
      } else {
        const androidPackage = "app.rork.slop_spot";
        const marketUrl = `market://details?id=${androidPackage}`;
        
        // Check if market URL can be opened (e.g. Play Store installed)
        const canOpen = await Linking.canOpenURL(marketUrl);
        
        if (canOpen) {
          await Linking.openURL(marketUrl);
        } else {
          // Fallback to web URL
          await Linking.openURL(`https://play.google.com/store/apps/details?id=${androidPackage}`);
        }
      }
    } catch (error) {
      console.log("Error opening review link:", error);
    } finally {
      // Always complete tutorial so user isn't stuck
      completeTutorial();
    }
  };

  // Swipe gesture removed - now using PanResponder

  if (showTutorial) {
    const step = tutorialSteps[currentStep];
    return (
      <View style={[styles.tutorialContainer, { backgroundColor: theme.background }]} {...panResponder.panHandlers}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <X size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={styles.tutorialContent}>
          {step.image ? (
            <View style={styles.tutorialImageContainer}>
              <Image 
                source={{ uri: step.image }} 
                style={styles.tutorialImage} 
                resizeMode="contain"
              />
            </View>
          ) : (
            <Text style={styles.tutorialIcon}>{step.icon}</Text>
          )}
          <Text style={[styles.tutorialTitle, { color: theme.text, fontSize: scaleFont(28) }]}>
            {step.title}
          </Text>
          <Text style={[styles.tutorialDescription, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
            {step.description}
          </Text>

          {/* Swipe hint - only show on first few steps */}
          {currentStep < tutorialSteps.length - 1 && (
            <Animated.View style={[styles.swipeHint, { opacity: swipeHintOpacity }]}>
              <ChevronLeft size={20} color={theme.textSecondary} />
              <Text style={[styles.swipeHintText, { color: theme.textSecondary, fontSize: scaleFont(14) }]}>
                Swipe to navigate
              </Text>
              <ChevronRight size={20} color={theme.textSecondary} />
            </Animated.View>
          )}
        </View>

        <View style={styles.tutorialFooter}>
          <View style={styles.dotsContainer}>
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentStep ? theme.primary : theme.border,
                    width: index === currentStep ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {currentStep === tutorialSteps.length - 1 ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.primary }]}
                onPress={handleRate}
              >
                <Text style={[styles.nextButtonText, { fontSize: scaleFont(16) }]}>
                  Leave a Review
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.border }]}
                onPress={completeTutorial}
              >
                <Text style={[styles.nextButtonText, { fontSize: scaleFont(16), color: theme.text }]}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
                onPress={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft size={24} color={currentStep === 0 ? theme.border : theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.primary, flex: 1 }]}
                onPress={handleNext}
              >
                <Text style={[styles.nextButtonText, { fontSize: scaleFont(16) }]}>
                  Next
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNext}
              >
                <ChevronRight size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.photoPreview} resizeMode="contain" />
          
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
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={replayTutorial}
                >
                  <HelpCircle size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { fontSize: scaleFont(32) }]}>Slop Spot</Text>
                <Text style={[styles.headerSubtitle, { fontSize: scaleFont(16) }]}>Scan product label</Text>
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

            <View style={styles.scanFrame} />

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={pickImageFromGallery}
              >
                <ImageIcon size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner}>
                  <Sparkles size={32} color="#118AB2" />
                </View>
              </TouchableOpacity>

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
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconButton: {
    padding: 4,
  },
  scanFrame: {
    flex: 1,
    marginHorizontal: 32,
    marginVertical: 100,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    borderStyle: "dashed",
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
  tutorialContainer: {
    flex: 1,
    paddingTop: 60,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  tutorialContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  tutorialImageContainer: {
    width: "100%",
    height: 320,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  tutorialImage: {
    width: "100%",
    height: "100%",
  },
  tutorialIcon: {
    fontSize: 80,
    marginBottom: 32,
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center",
    marginBottom: 16,
  },
  tutorialDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  swipeHintText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  tutorialFooter: {
    paddingHorizontal: 32,
    paddingBottom: 140,
    gap: 32,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});