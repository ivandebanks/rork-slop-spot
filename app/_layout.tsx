// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ScanProvider } from "@/contexts/ScanContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { ReferralProvider } from "@/contexts/ReferralContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
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
          title: "Upgrade",
          presentation: "modal"
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
        <PurchaseProvider>
          <ReferralProvider>
            <ScanProvider>
              <GestureHandlerRootView>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </ScanProvider>
          </ReferralProvider>
        </PurchaseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
