import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Camera, Sparkles, FlipHorizontal } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { useScans } from "@/contexts/ScanContext";
import { router } from "expo-router";
import { getGradeLabel, ScanResult } from "@/types/scan";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

const ingredientSchema = z.object({
  name: z.string(),
  rating: z.number().min(0).max(100),
  healthImpact: z.string(),
  explanation: z.string(),
});

const analysisSchema = z.object({
  productName: z.string(),
  ingredients: z.array(ingredientSchema),
  overallScore: z.number().min(0).max(100),
});

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const { addScan } = useScans();
  const { theme, scaleFont } = useTheme();

  const analyzeMutation = useMutation({
    mutationFn: async (imageUri: string) => {
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
                text: "Analyze this food/beverage/product label. Extract the product name and all ingredients. For each ingredient, rate it from 0-100 based on health impact (100 = excellent, 0 = very harmful). Provide a brief explanation of health impact. Then calculate an overall score (average of all ingredient ratings).",
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
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.push({
        pathname: "/result",
        params: { scanId: data.id },
      });
    },
  });

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
        <Camera size={64} color={theme.primary} />
        <Text style={[styles.permissionTitle, { color: theme.text, fontSize: scaleFont(24) }]}>Camera Access Required</Text>
        <Text style={[styles.permissionText, { color: theme.textSecondary, fontSize: scaleFont(16) }]}>
          Slop Spot needs camera access to scan product labels
        </Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: theme.primary }]} onPress={requestPermission}>
          <Text style={[styles.permissionButtonText, { fontSize: scaleFont(16) }]}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef && !analyzeMutation.isPending) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      if (photo && photo.base64) {
        analyzeMutation.mutate(`data:image/jpeg;base64,${photo.base64}`);
      }
    }
  };

  const toggleCameraFacing = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={setCameraRef}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontSize: scaleFont(32) }]}>Slop Spot</Text>
            <Text style={[styles.headerSubtitle, { fontSize: scaleFont(16) }]}>Scan product label</Text>
          </View>

          <View style={styles.scanFrame} />

          <View style={styles.controls}>
            {analyzeMutation.isPending ? (
              <View style={styles.analyzing}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={[styles.analyzingText, { fontSize: scaleFont(18) }]}>Analyzing ingredients...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                >
                  <FlipHorizontal size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner}>
                    <Sparkles size={32} color="#118AB2" />
                  </View>
                </TouchableOpacity>

                <View style={styles.flipButton} />
              </>
            )}
          </View>
        </View>
      </CameraView>
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
    alignItems: "center",
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
  analyzing: {
    flex: 1,
    alignItems: "center",
    gap: 16,
  },
  analyzingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600" as const,
  },
});