import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings as SettingsIcon, Shield, FileText, Mail, ChevronRight, Sparkles, Crown, Users, ExternalLink, Star } from "lucide-react-native";
import * as StoreReview from "expo-store-review";
import * as Device from "expo-device";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { AppearanceSection } from "@/features/settings/components/AppearanceSection";
import { AccessibilitySection } from "@/features/settings/components/AccessibilitySection";
import { OtherAppsSection } from "@/features/settings/components/OtherAppsSection";
import { LegalModal } from "@/features/settings/components/LegalModal";
import { ModalContent } from "@/features/settings/types";
import { styles } from "@/features/settings/styles";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const { themeMode, changeThemeMode, theme, textSizeMode, changeTextSizeMode, scaleFont } = useTheme();
  const { hasPremium, scansRemaining } = usePurchases();
  const { signOut } = useAuth();
  const [modalContent, setModalContent] = useState<ModalContent>(null);
  const [accessibilityExpanded, setAccessibilityExpanded] = useState(false);

  const toggleAccessibility = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccessibilityExpanded(!accessibilityExpanded);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleContactUs = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL("mailto:snapit.foranything@gmail.com");
  };

  const handleUpgrade = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/paywall" as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <SettingsIcon size={28} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: scaleFont(28) }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <AppearanceSection
          themeMode={themeMode}
          changeThemeMode={changeThemeMode}
          theme={theme}
          scaleFont={scaleFont}
        />

        <AccessibilitySection
          textSizeMode={textSizeMode}
          changeTextSizeMode={changeTextSizeMode}
          accessibilityExpanded={accessibilityExpanded}
          toggleAccessibility={toggleAccessibility}
          theme={theme}
          scaleFont={scaleFont}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            SUBSCRIPTION
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={[styles.subscriptionStatus, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={styles.subscriptionStatusLeft}>
                {hasPremium ? (
                  <Crown size={20} color="#FFD700" fill="#FFD700" />
                ) : (
                  <Sparkles size={20} color={theme.primary} />
                )}
                <View style={styles.subscriptionStatusText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    {hasPremium ? "Premium Active" : "Free Plan"}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    {scansRemaining} scans remaining
                  </Text>
                </View>
              </View>
            </View>

            {!hasPremium && (
              <TouchableOpacity
                style={styles.legalOption}
                onPress={handleUpgrade}
                activeOpacity={0.7}
              >
                <View style={styles.legalOptionLeft}>
                  <Sparkles size={20} color={theme.primary} />
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Upgrade to Premium
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            REFERRALS
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.legalOption}
              onPress={() => router.push("/referral" as any)}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <Users size={20} color={theme.primary} />
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  Refer Friends
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.legalOption}
              onPress={async () => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                if (await StoreReview.isAvailableAsync()) {
                  await StoreReview.requestReview();
                } else {
                  Linking.openURL("https://apps.apple.com/app/id6757214914?action=write-review");
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <Star size={20} color={theme.primary} />
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  Rate Us
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            FOLLOW US
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.legalOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => Linking.openURL("https://twitter.com/KiwiHealthScan")}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <Text style={{ fontSize: 18 }}>𝕏</Text>
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  @KiwiHealthScan
                </Text>
              </View>
              <ExternalLink size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalOption}
              onPress={() => Linking.openURL("https://instagram.com/kiwi_betterhealthscanner")}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <Text style={{ fontSize: 18 }}>📷</Text>
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  @kiwi_betterhealthscanner
                </Text>
              </View>
              <ExternalLink size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <OtherAppsSection theme={theme} scaleFont={scaleFont} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            APP INFO
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={[styles.infoOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                Age Rating
              </Text>
              <Text style={[styles.infoValue, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
                4+
              </Text>
            </View>
            {Device.modelName && (
              <View style={styles.infoOption}>
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  Device
                </Text>
                <Text style={[styles.infoValue, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
                  {Device.modelName}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            LEGAL
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.legalOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => {
                if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                setModalContent("privacy");
              }}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <Shield size={20} color={theme.primary} />
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  Privacy Policy
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.legalOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => {
                if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                setModalContent("terms");
              }}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <FileText size={20} color={theme.primary} />
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  Terms of Service
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalOption}
              onPress={handleContactUs}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <Mail size={20} color={theme.primary} />
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  Contact Us
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: async () => {
                    await signOut();
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Version 2.0.4
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LegalModal
        modalContent={modalContent}
        setModalContent={setModalContent}
        theme={theme}
        scaleFont={scaleFont}
      />
    </SafeAreaView>
  );
}
