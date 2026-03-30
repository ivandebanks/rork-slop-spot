// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ScanProvider } from "@/contexts/ScanContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PurchaseProvider, usePurchases } from "@/contexts/PurchaseContext";
import { ReferralProvider } from "@/contexts/ReferralContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TUTORIAL_KEY = "@slop_spot_tutorial_completed";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { hasPremium, isLoading: isPurchaseLoading } = usePurchases();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const segments = useSegments();
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then((value) => {
      setTutorialCompleted(value === "true");
    });
  }, []);

  // Re-check tutorial status when navigating (after onboarding completes)
  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then((value) => {
      setTutorialCompleted(value === "true");
    });
  }, [segments]);

  // Auth routing
  useEffect(() => {
    if (isAuthLoading) return;

    const onLogin = segments[0] === "login";

    if (!isAuthenticated && !onLogin) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && onLogin) {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, isAuthLoading, segments]);

  // Onboarding -> Paywall -> App routing
  useEffect(() => {
    if (isAuthLoading || isPurchaseLoading) return;
    if (!isAuthenticated) return;
    if (tutorialCompleted === null) return;

    const currentScreen = segments[0];
    const onLogin = currentScreen === "login";
    const onOnboarding = currentScreen === "onboarding";
    const onPaywall = currentScreen === "paywall";

    if (onLogin) return;

    // Step 1: Not done onboarding? Go to onboarding
    if (!tutorialCompleted && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }

    // Step 2: Done onboarding but no premium? Go to paywall
    if (tutorialCompleted && !hasPremium && !onPaywall && !onOnboarding) {
      router.replace("/paywall");
      return;
    }
  }, [hasPremium, isPurchaseLoading, isAuthenticated, isAuthLoading, segments, tutorialCompleted]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="result"
        options={{
          title: "Scan Result",
          presentation: "card"
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: "modal",
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="referral"
        options={{
          title: "Refer Friends",
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PurchaseProvider>
            <ReferralProvider>
              <ScanProvider>
                <GestureHandlerRootView>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </ScanProvider>
            </ReferralProvider>
          </PurchaseProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
