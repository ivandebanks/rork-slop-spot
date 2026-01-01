import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Linking,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings as SettingsIcon, Check, Type, Shield, FileText, Mail, ChevronRight, X } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

type ThemeMode = "light" | "dark" | "system";

const PRIVACY_POLICY = `Privacy Policy for Slop Spot

Last updated: December 31, 2025

Slop Spot ("we," "our," or "us") values your privacy. This Privacy Policy explains how information is handled when you use the Slop Spot mobile application (the "App").

1. Information We Process

Slop Spot allows users to take photos of food, drinks, and food items or packaged goods for analysis and feedback within the app.
• Photos are used only to provide the app's functionality.
• We do not require users to create an account.
• We do not collect names, email addresses, phone numbers, or other personal identifiers.

2. Photo and Camera Data
• Photos taken in the app are processed temporarily to deliver results to the user.
• We do not store, save, sell, or share user photos.
• Photos are not linked to your identity.
• All photo processing occurs only for the immediate purpose of app functionality.

3. Data Storage
• Slop Spot does not store user-uploaded images on our servers after processing.
• We do not maintain a database of user photos or food scans.
• Any data used during processing is discarded once the result is delivered.

4. Third-Party Services

Slop Spot may use third-party tools or services solely to support app functionality (such as image processing or analytics). These services are required to comply with privacy standards and do not receive personally identifiable information.

5. Children's Privacy

Slop Spot is not directed at children under the age of 16. We do not knowingly collect any personal information from children.

6. Data Security

We take reasonable measures to protect all data processed within the app and limit access to only what is necessary for functionality.

7. Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be posted within the app or on our app listing. Continued use of the app after changes means you accept the updated policy.

8. Contact Us

If you have any questions or concerns about this Privacy Policy, you may contact us at:

Email: slopspotapp@gmail.com`;

const TERMS_OF_SERVICE = `Terms of Service

By downloading, accessing, or using the Slop Spot mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the App.

1. Description of the Service

Slop Spot allows users to take photos of food, drinks, and food items or packaged goods and receive feedback, analysis, or informational results based on those images.

The App is provided for informational and entertainment purposes only.

2. Eligibility

You must be at least 16 years old to use Slop Spot. By using the App, you confirm that you meet this requirement.

3. User Content
• You may upload photos of food, drinks, and packaged goods ("User Content").
• You retain ownership of your User Content.
• By using the App, you grant Slop Spot a limited, temporary license to process your photos solely to provide app functionality.
• We do not store, sell, or share your photos.

You agree not to upload:
• Illegal or harmful content
• Content that violates laws or regulations
• Content that infringes on the rights of others

4. No Guarantees or Professional Advice

Slop Spot does not provide medical, nutritional, dietary, or professional advice.
• Results are automated and may be inaccurate.
• You should not rely on the App for health, allergy, or dietary decisions.
• Always consult a qualified professional when needed.

Use the App at your own risk.

5. Acceptable Use

You agree not to:
• Abuse, exploit, or attempt to reverse engineer the App
• Use the App for unlawful purposes
• Interfere with or disrupt the App's operation
• Attempt to access systems or data not intended for users

6. Intellectual Property

All app content, branding, logos, and software (excluding User Content) are owned by Slop Spot or its licensors and are protected by intellectual property laws.

You may not copy, modify, distribute, or resell any part of the App without permission.

7. Termination

We reserve the right to suspend or terminate access to the App at any time if you violate these Terms or misuse the App.

8. Disclaimer of Warranties

Slop Spot is provided "as is" and "as available."

We make no warranties regarding:
• Accuracy of results
• Availability or uptime
• Fitness for a particular purpose

9. Limitation of Liability

To the fullest extent permitted by law, Slop Spot shall not be liable for any damages arising from:
• Use of or inability to use the App
• Errors or inaccuracies in results
• Decisions made based on App output

10. Changes to These Terms

We may update these Terms from time to time. Continued use of the App after changes means you accept the updated Terms.

11. Governing Law

These Terms are governed by the laws of the United States, without regard to conflict of law principles.

12. Contact Information

If you have questions about these Terms, contact us at:

Email: slopspotapp@gmail.com`;

type ModalContent = "privacy" | "terms" | null;

export default function SettingsScreen() {
  const { themeMode, changeThemeMode, theme, largeTextMode, toggleLargeTextMode, scaleFont } = useTheme();
  const [modalContent, setModalContent] = useState<ModalContent>(null);

  const handleContactUs = () => {
    Linking.openURL("mailto:slopspotapp@gmail.com");
  };

  const getModalTitle = () => {
    if (modalContent === "privacy") return "Privacy Policy";
    if (modalContent === "terms") return "Terms of Service";
    return "";
  };

  const getModalText = () => {
    if (modalContent === "privacy") return PRIVACY_POLICY;
    if (modalContent === "terms") return TERMS_OF_SERVICE;
    return "";
  };

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "light", label: "Light Mode" },
    { value: "dark", label: "Dark Mode" },
    { value: "system", label: "System Preferences" },
  ];

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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            APPEARANCE
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {themeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  index !== themeOptions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => changeThemeMode(option.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                  {option.label}
                </Text>
                {themeMode === option.value && (
                  <View
                    style={[
                      styles.checkContainer,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            ACCESSIBILITY
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.switchOption}>
              <View style={styles.switchOptionLeft}>
                <Type size={20} color={theme.primary} />
                <View style={styles.switchOptionText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Large Text Mode
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    Increases all font sizes by 1.5x
                  </Text>
                </View>
              </View>
              <Switch
                value={largeTextMode}
                onValueChange={toggleLargeTextMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            APP INFO
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.infoOption}>
              <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                Age Rating
              </Text>
              <Text style={[styles.infoValue, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
                16+ (15+ for Australia)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            LEGAL
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.legalOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => setModalContent("privacy")}
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
              onPress={() => setModalContent("terms")}
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

        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Version 1.0.0
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={modalContent !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalContent(null)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]} edges={["top"]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
              {getModalTitle()}
            </Text>
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.card }]}
              onPress={() => setModalContent(null)}
            >
              <X size={20} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <Text style={[styles.modalText, { color: theme.text, fontSize: scaleFont(14) }]}>
              {getModalText()}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  switchOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  switchOptionLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flex: 1,
  },
  switchOptionText: {
    flex: 1,
    gap: 4,
  },
  optionDescription: {
    fontSize: 13,
  },
  legalOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  legalOptionLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  bottomSpacer: {
    height: 40,
  },
  versionSection: {
    alignItems: "center" as const,
    paddingTop: 32,
    paddingBottom: 16,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  infoOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
