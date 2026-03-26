import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { colors } from "@/constants/colors";

type ThemeMode = "light" | "dark" | "system";
type TextSizeMode = "normal" | "medium" | "large" | "extraLarge";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [textSizeMode, setTextSizeMode] = useState<TextSizeMode>("normal");

  const themeModeQuery = useQuery({
    queryKey: ["themeMode"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem("themeMode");
        if (!stored) return "system";
        if (["light", "dark", "system"].includes(stored)) {
          return stored as ThemeMode;
        }
        return "system";
      } catch (error) {
        console.log("Error loading theme mode:", error);
        return "system";
      }
    },
  });

  const textSizeModeQuery = useQuery({
    queryKey: ["textSizeMode"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem("textSizeMode");
        if (!stored) return "normal";
        if (["normal", "medium", "large", "extraLarge"].includes(stored)) {
          return stored as TextSizeMode;
        }
        return "normal";
      } catch (error) {
        console.log("Error loading text size mode:", error);
        return "normal";
      }
    },
  });

  const saveThemeModeMutation = useMutation({
    mutationFn: async (mode: ThemeMode) => {
      await AsyncStorage.setItem("themeMode", mode);
      return mode;
    },
  });

  const saveTextSizeModeMutation = useMutation({
    mutationFn: async (mode: TextSizeMode) => {
      await AsyncStorage.setItem("textSizeMode", mode);
      return mode;
    },
  });

  useEffect(() => {
    if (themeModeQuery.data) {
      setThemeMode(themeModeQuery.data);
    }
  }, [themeModeQuery.data]);

  useEffect(() => {
    if (textSizeModeQuery.data !== undefined) {
      setTextSizeMode(textSizeModeQuery.data);
    }
  }, [textSizeModeQuery.data]);

  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeModeMutation.mutate(mode);
  };

  const changeTextSizeMode = (mode: TextSizeMode) => {
    setTextSizeMode(mode);
    saveTextSizeModeMutation.mutate(mode);
  };

  // Legacy support for existing code
  const toggleLargeTextMode = () => {
    const newMode = textSizeMode === "normal" ? "medium" : "normal";
    changeTextSizeMode(newMode);
  };

  const scaleFont = (size: number): number => {
    switch (textSizeMode) {
      case "medium":
        return size * 1.25;
      case "large":
        return size * 1.5;
      case "extraLarge":
        return size * 2;
      default:
        return size;
    }
  };

  const activeColorScheme =
    themeMode === "system"
      ? systemColorScheme || "light"
      : themeMode;

  const theme = colors[activeColorScheme];

  return {
    themeMode,
    changeThemeMode,
    theme,
    activeColorScheme,
    textSizeMode,
    changeTextSizeMode,
    // Legacy support
    largeTextMode: textSizeMode !== "normal",
    toggleLargeTextMode,
    scaleFont,
  };
});