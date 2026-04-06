import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Moon, Leaf } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";
import { useState } from "react";

export default function LoginScreen() {
  const { theme, activeColorScheme, changeThemeMode, scaleFont } = useTheme();
  const { signInWithApple, signInAsGuest } = useAuth();
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const isDark = activeColorScheme === "dark";

  const handleToggleTheme = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    changeThemeMode(isDark ? "light" : "dark");
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Unavailable", "Apple Sign In is only available on iOS devices.");
      return;
    }

    setIsAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const fullName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ") || null
        : null;

      await signInWithApple(fullName);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      if (error.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Sign In Failed", "Unable to sign in with Apple. Please try again.");
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    setIsGuestLoading(true);
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await signInAsGuest();
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Theme toggle - top left */}
      <TouchableOpacity
        style={[
          styles.themeToggle,
          {
            backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
          },
        ]}
        onPress={handleToggleTheme}
        activeOpacity={0.7}
        accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
        accessibilityRole="button"
      >
        {isDark ? (
          <Sun size={20} color="#D4AF37" />
        ) : (
          <Moon size={20} color="#D4AF37" />
        )}
      </TouchableOpacity>

      {/* Logo and branding */}
      <View style={styles.brandSection}>
        <Text style={[styles.appName, { color: theme.text, fontSize: scaleFont(36) }]}>
          Kiwi
        </Text>
        <View style={styles.taglineRow}>
          <Leaf size={14} color="#D4AF37" />
          <Text style={[styles.tagline, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
            Know what you're really eating
          </Text>
        </View>
      </View>

      {/* Auth buttons */}
      <View style={styles.authSection}>
        {/* Apple Sign In */}
        {Platform.OS === "ios" ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={16}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        ) : (
          <TouchableOpacity
            style={[
              styles.appleButtonFallback,
              {
                backgroundColor: isDark ? "#FFFFFF" : "#000000",
              },
            ]}
            onPress={handleAppleSignIn}
            activeOpacity={0.85}
            disabled={isAppleLoading}
          >
            {isAppleLoading ? (
              <ActivityIndicator size="small" color={isDark ? "#000000" : "#FFFFFF"} />
            ) : (
              <Text
                style={[
                  styles.appleButtonText,
                  {
                    color: isDark ? "#000000" : "#FFFFFF",
                    fontSize: scaleFont(17),
                  },
                ]}
              >
                Sign in with Apple
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Continue as Guest */}
        <TouchableOpacity
          style={[
            styles.guestButton,
            {
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
            },
          ]}
          onPress={handleGuestContinue}
          activeOpacity={0.7}
          disabled={isGuestLoading}
        >
          {isGuestLoading ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <Text
              style={[
                styles.guestButtonText,
                {
                  color: theme.textSecondary,
                  fontSize: scaleFont(16),
                },
              ]}
            >
              Continue as Guest
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={[styles.footerText, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  themeToggle: {
    position: "absolute",
    top: 58,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  appName: {
    fontWeight: "900",
    letterSpacing: -1,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  tagline: {
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  authSection: {
    width: "100%",
    maxWidth: 320,
    gap: 14,
  },
  appleButton: {
    width: "100%",
    height: 54,
  },
  appleButtonFallback: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  appleButtonText: {
    fontWeight: "600",
  },
  guestButton: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  guestButtonText: {
    fontWeight: "600",
  },
  footerText: {
    position: "absolute",
    bottom: 40,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 16,
  },
});
