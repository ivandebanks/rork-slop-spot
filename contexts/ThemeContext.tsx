import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { colors } from "@/constants/colors";

type ThemeMode = "light" | "dark" | "system";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [largeTextMode, setLargeTextMode] = useState<boolean>(false);

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

  const largeTextModeQuery = useQuery({
    queryKey: ["largeTextMode"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem("largeTextMode");
        return stored === "true";
      } catch (error) {
        console.log("Error loading large text mode:", error);
        return false;
      }
    },
  });

  const saveThemeModeMutation = useMutation({
    mutationFn: async (mode: ThemeMode) => {
      await AsyncStorage.setItem("themeMode", mode);
      return mode;
    },
  });

  const saveLargeTextModeMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await AsyncStorage.setItem("largeTextMode", enabled.toString());
      return enabled;
    },
  });

  useEffect(() => {
    if (themeModeQuery.data) {
      setThemeMode(themeModeQuery.data);
    }
  }, [themeModeQuery.data]);

  useEffect(() => {
    if (largeTextModeQuery.data !== undefined) {
      setLargeTextMode(largeTextModeQuery.data);
    }
  }, [largeTextModeQuery.data]);

  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeModeMutation.mutate(mode);
  };

  const toggleLargeTextMode = () => {
    const newValue = !largeTextMode;
    setLargeTextMode(newValue);
    saveLargeTextModeMutation.mutate(newValue);
  };

  const scaleFont = (size: number): number => {
    return largeTextMode ? size * 1.5 : size;
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
    largeTextMode,
    toggleLargeTextMode,
    scaleFont,
  };
});
