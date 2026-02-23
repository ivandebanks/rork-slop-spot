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
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings as SettingsIcon, Check, Type, Shield, FileText, Mail, ChevronRight, X, Sparkles, Crown } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

type ThemeMode = "light" | "dark" | "system";

const PRIVACY_POLICY = `Privacy Policy
Kiwi - Better Health Scanner
Last Updated: January 18, 2026

Overview
Kiwi - Better Health Scanner ("we," "us," or "our") respects your privacy. This Privacy Policy explains how information is handled when you use our mobile application.

By using Kiwi, you agree to the practices described in this policy.

Camera and Image Data Collection
IMPORTANT: Our app uses your device camera to scan product labels for ingredient analysis and health ratings.

What We Collect
• Temporary camera access to capture photos of product labels, barcodes, and ingredient lists
• On-device image capture to extract photos from food and beverage packaging
• The app scans product labels to read ingredient information

How We Use It
• All image scanning and analysis occurs entirely on your device using on-device AI processing
• We extract product names and ingredient lists from photos to calculate health ratings
• The ratings are provided for informational and entertainment purposes only
• No images, photos, or scanned data are uploaded to any server
• Photos are processed in real-time on your device and immediately discarded after analysis
• No biometric identification, facial recognition, or personally identifiable data is extracted

What We DON'T Do
• We do NOT upload photos or scanned images to any server
• We do NOT share camera data or images with third parties
• We do NOT store photos on your device or our servers beyond the scan session
• We do NOT use images for any purpose beyond displaying ingredient ratings
• We do NOT retain any image data after analysis is complete
• We do NOT sell or share your photos with anyone

Data Retention for Images
• Images are captured and processed in real-time entirely on your device
• All image data is immediately discarded from device memory after the ingredient analysis is displayed (typically within seconds)
• No image data persists on your device or anywhere else after analysis
• The app does not maintain any history of your photos

Your Control
• You must grant camera permission to use the scanning feature
• You can revoke camera access at any time through your device settings
• Each scan requires you to actively capture or select a new photo
• No photos are taken without your explicit action

Scan History and Local Storage

What We Store Locally
• Scan results only (product names, ingredient lists, and text-based ratings) are stored on your device using local storage (AsyncStorage)
• A thumbnail of your scanned product image is stored locally on your device so you can view your scan history
• Your sorting preferences for viewing scan history (e.g., sort by date, name, or rating)
• The number of free scans you have used today (resets daily)
• A record of whether you have completed the in-app tutorial

Your Control Over Scan History
• You can delete individual scans at any time using the delete button
• You can sort and organize your scan history using the sorting settings
• All scan history and preferences are stored locally on your device only
• Uninstalling the app will permanently delete all stored scan results and settings
• We have no access to your locally stored scan history
• No locally stored scan history is uploaded to servers or shared with anyone

Tutorial and App Features
The app includes a tutorial to help you understand how to use the scanning and analysis features. The tutorial:
• Runs locally on your device
• Records locally whether you have completed it (so it does not show again)
• Does not send any information to external servers
• Can be replayed at any time from the Settings screen

Personal Information
We do NOT collect personal information such as:
• Names, email addresses, phone numbers, or account credentials
• User accounts or profiles
• Login or registration information

How Ingredient Analysis Works
The app uses on-device AI processing to:
• Capture a photo of a product label using your camera or photo library
• Analyze the image entirely on your device to extract ingredient names
• Calculate health ratings based on the extracted ingredients
• Display the results to you within the app

All processing happens on your device. No photos or ingredient data are sent to external servers.

Third-Party Services
Kiwi uses the following third-party services:

1. RevenueCat (In-App Purchases)
   • Purpose: Manages premium subscription purchases and restores
   • Data shared: Anonymous purchase transaction data and device identifiers as required to validate purchases
   • Data retained: Per RevenueCat's data retention policies
   • Privacy policy: https://www.revenuecat.com/privacy

2. Expo (App Platform and Crash Reporting)
   • Purpose: Provides the app runtime and may collect anonymous crash and diagnostic data
   • Data shared: Anonymous crash logs and device diagnostics (no personal data or scan content)
   • Privacy policy: https://expo.dev/privacy

These third-party services do NOT receive:
• Your photos or images
• Scan results or ingredient data
• Your scan history
• Any personally identifying information

No Social Features or Data Sharing
• The app does NOT include social features, voting, or sharing capabilities beyond the native OS share sheet
• Scan results are private to you
• We do not maintain a server-side database of your scan results

Entertainment and Informational Purposes Only
DISCLAIMER: Ingredient ratings and health scores provided by Kiwi are for informational and entertainment purposes only. They are:
• NOT medical advice or nutritional guidance
• NOT professionally validated health assessments
• NOT a substitute for professional dietary advice
• NOT intended for use in medical or health decisions

Always consult qualified healthcare professionals and registered dietitians for dietary decisions and health concerns.

Children's Privacy
Kiwi is rated 4+ and is appropriate for users of all ages. We do not knowingly collect personal information from anyone, including children. If you are a parent or guardian and have questions about your child's use of the app, please contact us.

Data Security
We take reasonable measures to protect your data:
• Photos are transmitted over encrypted (HTTPS) connections to our AI processing service
• Scan results are stored only on your device using secure local storage
• We do not maintain a server-side database of your personal scan history
• RevenueCat handles all payment processing using industry-standard security

Your Rights
• We do not collect or store personal data or scan results on Kiwi's own servers
• Once you delete the app, all local scan history is permanently removed from your device
• You control scan data through your device and the in-app delete functions
• For questions about data held by third-party services (RevenueCat, Rork AI), please refer to their respective privacy policies

International Data Transfers
• All scanning and analysis occurs on your device with no data transfers for image processing
• Your photos and scan results never leave your device
• RevenueCat's servers may be located outside your country of residence for purchase processing

Region-Specific Information

California Residents (CCPA)
We do not sell personal information. Since all image processing occurs on-device, no scan data leaves your device. Scan data is stored locally on your device under your control. For data processed by RevenueCat in connection with your use of the app, please refer to their privacy policy and CCPA disclosures.

European Economic Area Residents (GDPR)
Our legal basis for processing camera images is your consent (camera permission and your explicit action of taking a photo). Your legal basis for in-app purchase processing is the performance of a contract. Since all image analysis happens on-device, no image data is transferred outside your device. You can withdraw camera consent by revoking access in device settings. For GDPR inquiries related to RevenueCat, please refer to their privacy policy.

Australian Residents
We comply with the Australian Privacy Principles. Since all image analysis occurs on-device with no data transfers, APP requirements for cross-border data handling do not apply to scan data. For details on RevenueCat's data handling, please refer to their privacy policy.

Changes to This Policy
We may update this Privacy Policy from time to time. Any changes will be reflected by updating the "Last Updated" date at the top of this policy. We will notify you of material changes through the app or other reasonable means. Continued use of the app after changes constitutes acceptance of the updated policy.

Contact Us
If you have questions about this Privacy Policy or how your data is handled, you can contact us at:

Email: snapit.foranything@gmail.com

By using the Kiwi app, you acknowledge that you have read and understood this Privacy Policy, including the on-device processing of images and the entertainment-only nature of ingredient ratings.`;

const TERMS_OF_SERVICE = `Terms of Service
Kiwi - Better Health Scanner
Last Updated: January 18, 2026

By downloading, accessing, or using the Kiwi mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the App.

1. Description of the Service
Kiwi allows users to take photos of food, drinks, and food items or packaged goods and receive feedback, analysis, or informational results based on those images.

The App is provided for informational and entertainment purposes only.

2. Eligibility
You must be at least 4 years old to use Kiwi. By using the App, you confirm that you meet this requirement.

3. User Content
• You may upload photos of food, drinks, and packaged goods ("User Content").
• You retain ownership of your User Content.
• By using the App, you grant Kiwi a limited, temporary license to process your photos solely to provide app functionality, including transmitting them to our AI analysis service.
• We do not sell your photos.
• Photos are transmitted to our AI processing service for analysis and are not permanently stored by Kiwi after analysis is complete.

You agree not to upload:
• Illegal or harmful content
• Content that violates laws or regulations
• Content that infringes on the rights of others

4. Scan History and Data Storage
• The App stores scan results (text-based product names, ingredients, and ratings) locally on your device.
• You can delete scan results at any time using the in-app delete function.
• Uninstalling the App permanently deletes all stored scan history.
• We do not have access to your locally stored scan history.

5. No Guarantees or Professional Advice
Kiwi does not provide medical, nutritional, dietary, or professional advice.
• Results are generated by AI and may be inaccurate.
• You should not rely on the App for health, allergy, or dietary decisions.
• Always consult a qualified professional when needed.

Use the App at your own risk.

6. Acceptable Use
You agree not to:
• Abuse, exploit, or attempt to reverse engineer the App
• Use the App for unlawful purposes
• Interfere with or disrupt the App's operation
• Attempt to access systems or data not intended for users

7. Intellectual Property
All app content, branding, logos, and software (excluding User Content) are owned by Kiwi or its licensors and are protected by intellectual property laws.

You may not copy, modify, distribute, or resell any part of the App without permission.

8. Termination
We reserve the right to suspend or terminate access to the App at any time if you violate these Terms or misuse the App.

9. Disclaimer of Warranties
Kiwi is provided "as is" and "as available."

We make no warranties regarding:
• Accuracy of results
• Availability or uptime
• Fitness for a particular purpose
• Uninterrupted or error-free operation

10. Limitation of Liability
To the fullest extent permitted by law, Kiwi shall not be liable for any damages arising from:
• Use of or inability to use the App
• Errors or inaccuracies in results
• Decisions made based on App output

11. Updates and Modifications
We may update, modify, or discontinue any feature of the App at any time without notice.

12. Changes to These Terms
We may update these Terms from time to time. Continued use of the App after changes means you accept the updated Terms.

13. Governing Law
These Terms are governed by the laws of the United States, without regard to conflict of law principles.

14. Contact Information
If you have questions about these Terms, contact us at:

Email: snapit.foranything@gmail.com

By using the Kiwi app, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.`;

type ModalContent = "privacy" | "terms" | null;

export default function SettingsScreen() {
  const { themeMode, changeThemeMode, theme, textSizeMode, changeTextSizeMode, scaleFont } = useTheme();
  const { hasPremium, scansRemaining } = usePurchases();
  const [modalContent, setModalContent] = useState<ModalContent>(null);

  const handleContactUs = () => {
    Linking.openURL("mailto:snapit.foranything@gmail.com");
  };



  const handleUpgrade = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/paywall" as any);
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
            <View style={[styles.switchOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={styles.switchOptionLeft}>
                <Type size={18} color={theme.primary} />
                <View style={styles.switchOptionText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Medium Text Mode
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    Increases all font sizes by 1.25x
                  </Text>
                </View>
              </View>
              <Switch
                value={textSizeMode === "medium"}
                onValueChange={(value) => changeTextSizeMode(value ? "medium" : "normal")}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.switchOption, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={styles.switchOptionLeft}>
                <Type size={20} color={theme.primary} strokeWidth={2} />
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
                value={textSizeMode === "large"}
                onValueChange={(value) => changeTextSizeMode(value ? "large" : "normal")}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.switchOption}>
              <View style={styles.switchOptionLeft}>
                <Type size={24} color={theme.primary} strokeWidth={2.5} />
                <View style={styles.switchOptionText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Extra Large Text Mode
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                    Increases all font sizes by 2x
                  </Text>
                </View>
              </View>
              <Switch
                value={textSizeMode === "extraLarge"}
                onValueChange={(value) => changeTextSizeMode(value ? "extraLarge" : "normal")}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

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
            APP INFO
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.infoOption}>
              <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                Age Rating
              </Text>
              <Text style={[styles.infoValue, { color: theme.textSecondary, fontSize: scaleFont(15) }]}>
                4+
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
            Version 2.0.0
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
  subscriptionStatus: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  subscriptionStatusLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  subscriptionStatusText: {
    flex: 1,
    gap: 4,
  },
  upgradeOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
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