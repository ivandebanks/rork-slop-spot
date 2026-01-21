import { Tabs } from "expo-router";
import { Camera, History, Settings } from "lucide-react-native";
import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";

export default function TabLayout() {
  const { theme, activeColorScheme } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          position: "absolute" as const,
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.tabBar,
          borderTopWidth: 0,
          height: 98,
          paddingBottom: 42,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
        },
        tabBarBackground: () => (
          Platform.OS === "ios" ? (
            <GlassView
              glassEffectStyle="regular"
              style={StyleSheet.absoluteFill}
            />
          ) : Platform.OS === "web" ? (
            <BlurView
              intensity={80}
              tint={activeColorScheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.tabBar }]} />
          )
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}