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
  LayoutAnimation,
  UIManager,
} from "react-native";
import ReAnimated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings as SettingsIcon, Check, Type, Shield, FileText, Mail, ChevronRight, ChevronDown, X, Sparkles, Crown, Users, ExternalLink, Accessibility, Grid3X3 } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OTHER_APPS = [
  { name: "MOG - Face Analysis", id: "6757218071" },
  { name: "Snap It: Kosher Check", id: "6757688071" },
  { name: "Aura Check", id: "6757377930" },
  { name: "Peptide Hub", id: "6759482842" },
  { name: "Snap It: Regrow", id: "6758930237" },
  { name: "Snap It: Math", id: "6757666027" },
];

type ThemeMode = "light" | "dark" | "system";

const PRIVACY_POLICY = `Privacy Policy
Kiwi - Better Health Scanner
Last Updated: March 9, 2026

Overview
Kiwi - Better Health Scanner ("we," "us," or "our") respects your privacy. This Privacy Policy explains how information is collected, used, and handled when you use our mobile application.

By using Kiwi, you agree to the practices described in this policy.

Camera and Image Data Collection
IMPORTANT: Our app uses your device camera to scan product labels for ingredient analysis and health ratings.

What We Collect
• Temporary camera access to capture photos of product labels, barcodes, and ingredient lists
• Photos you take or select from your photo library for ingredient analysis

How We Use It
• Photos are transmitted over encrypted (HTTPS) connections to our AI processing service (Rork AI) for ingredient analysis
• Our AI service extracts product names, ingredient lists, and calculates health ratings from your photos
• The ratings are provided for informational and entertainment purposes only
• Photos are not permanently stored on our servers and are deleted after analysis is complete
• A thumbnail of your scanned image is saved locally on your device for scan history
• No biometric identification, facial recognition, or personally identifiable data is extracted from your photos

What We DON'T Do
• We do NOT permanently store your photos on any server
• We do NOT use your photos for AI training, advertising, or any purpose beyond providing your scan results
• We do NOT sell or share your photos with anyone
• We do NOT extract personal or identifying information from your images

Data Retention for Images
• Photos are transmitted to Rork AI for processing and are deleted from the server immediately after analysis (typically within seconds)
• A thumbnail copy is stored locally on your device as part of your scan history
• You can delete any scan (including its thumbnail) at any time
• Uninstalling the app permanently removes all locally stored images

Your Control
• You must grant camera permission to use the scanning feature
• You can also pick images from your photo library instead of using the camera
• You can revoke camera access at any time through your device settings
• Each scan requires you to actively capture or select a new photo
• No photos are taken without your explicit action

How Ingredient Analysis Works
When you scan a product:
1. You take a photo or select one from your gallery
2. The photo is sent over an encrypted connection to Rork AI's servers
3. Rork AI analyzes the image to extract ingredients and calculate health ratings
4. Results (product name, ingredient ratings, scores, citations, company info, company reputation scores, and alternatives) are returned to your device
5. The photo is deleted from Rork AI's servers after processing
6. Results are stored locally on your device for your scan history

Scan History and Local Storage

What We Store Locally
All of the following data is stored only on your device using local storage (AsyncStorage). We do not have access to any of it.

• Scan results: product names, ingredient lists, health ratings, scores, scientific citations, company ownership information, company reputation scores, and suggested alternatives
• A thumbnail image of each scanned product
• Your sorting preferences for scan history (e.g., sort by date, name, or rating)
• Favorite scans you have marked
• The number of free scans used today (resets daily)
• A record of whether you have completed the in-app tutorial
• Your theme preference (light, dark, or system)
• Your text size accessibility preference

Your Control Over Scan History
• You can delete individual scans at any time using the delete button or swipe to delete
• You can clear all scan history at once
• All scan history and preferences are stored locally on your device only
• Uninstalling the app will permanently delete all stored scan results and settings
• We have no access to your locally stored scan history
• No locally stored scan history is uploaded to servers or shared with anyone

Referral System
Kiwi includes a peer-to-peer referral system that works without any server or account.

What We Store for Referrals (locally on your device only):
• A randomly generated 8-character referral secret (your referral identity)
• A device fingerprint derived from your screen dimensions, display scale, operating system, and OS version (used for fraud prevention)
• A count of successful referrals
• A record of referral codes you have used (to prevent duplicates)
• A record of device fingerprints you have interacted with (to prevent same-device gaming)
• Failed attempt count and lockout timestamp (3 failed attempts triggers a 36-hour lockout)
• Referral premium status and expiry date (if earned)

How Referral Codes Work:
• Referral and confirmation codes are generated locally on your device
• Codes are shared directly between users (peer-to-peer) via text, messaging apps, or other means
• Codes contain your referral secret, device fingerprint, and a timestamp, encoded with a simple cipher
• No referral data is sent to our servers or any third party
• All referral validation happens locally on each user's device

Device Fingerprint:
• We generate a non-unique device fingerprint from your screen size, display scale, platform, and OS version
• This is used solely to prevent referral fraud (e.g., uninstalling and reinstalling to re-use codes)
• This fingerprint cannot identify you personally and is stored only on your device

Personal Information
We do NOT collect personal information such as:
• Names, email addresses, phone numbers, or account credentials
• User accounts or profiles
• Login or registration information
• Location data
• Contacts or call history
• Advertising identifiers (IDFA or Android Ad ID)

Third-Party Services
Kiwi uses the following third-party services:

1. Rork AI (Ingredient Analysis)
   • Purpose: Processes photos of product labels to extract ingredients and calculate health ratings
   • Data shared: The photo you scan (transmitted over HTTPS)
   • Data retained: Photos are deleted immediately after processing; no permanent storage
   • Rork AI does NOT receive your scan history, personal information, or any data beyond the individual photo being analyzed

2. RevenueCat (In-App Purchases)
   • Purpose: Manages premium subscription purchases and purchase restoration
   • Data shared: Anonymous purchase transaction data and platform device identifiers as required to validate purchases
   • Data retained: Per RevenueCat's data retention policies
   • RevenueCat does NOT receive your photos, scan results, or scan history
   • Privacy policy: https://www.revenuecat.com/privacy

3. Expo (App Platform)
   • Purpose: Provides the app runtime and may collect anonymous crash and diagnostic data
   • Data shared: Anonymous crash logs and device diagnostics (no personal data or scan content)
   • Privacy policy: https://expo.dev/privacy

No Social Features or Data Sharing
• The app does NOT include social features, voting, or user-generated content sharing
• Referral codes are shared directly between users using the native OS share sheet
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
Kiwi is rated 4+ and is appropriate for users of all ages. We do not collect personal information from anyone, including children. The app does not require an account, login, or any personal details. The device fingerprint used for the referral system is non-identifying and stored only on-device. If you are a parent or guardian and have questions about your child's use of the app, please contact us.

Data Security
We take reasonable measures to protect your data:
• Photos are transmitted over encrypted (HTTPS) connections to Rork AI for analysis
• Photos are deleted from Rork AI's servers immediately after processing
• Scan results are stored only on your device using local storage
• We do not maintain a server-side database of your scan history or personal data
• RevenueCat handles all payment processing using industry-standard security
• Referral codes use encoding to prevent casual tampering (not cryptographic-grade security)

Your Rights
• You can delete any or all scan history at any time within the app
• Once you delete the app, all local data (scans, preferences, referral data) is permanently removed from your device
• You control all scan and referral data through the app's built-in functions
• For questions about data held by third-party services (RevenueCat, Rork AI, Expo), please refer to their respective privacy policies

International Data Transfers
• Photos are transmitted to Rork AI's servers for processing. These servers may be located outside your country of residence
• Photos are not permanently stored and are deleted after analysis
• Scan results and all other app data remain on your device
• RevenueCat's servers may be located outside your country of residence for purchase processing

Region-Specific Information

California Residents (CCPA)
We do not sell personal information. Photos are transmitted to Rork AI solely for ingredient analysis and are not retained. Scan data is stored locally on your device under your control. For data processed by RevenueCat in connection with your use of the app, please refer to their privacy policy and CCPA disclosures.

European Economic Area Residents (GDPR)
Our legal basis for processing your photos is your consent (camera permission and your explicit action of taking or selecting a photo). Photos are transmitted to Rork AI for processing under a legitimate interest basis (providing the service you requested) and are deleted immediately after analysis. Your legal basis for in-app purchase processing is the performance of a contract. You can withdraw camera consent by revoking access in device settings. For GDPR inquiries related to RevenueCat or Rork AI, please refer to their respective privacy policies.

Australian Residents
We comply with the Australian Privacy Principles. Photos are transmitted to Rork AI for processing and are not retained. For details on RevenueCat's and Rork AI's data handling, please refer to their respective privacy policies.

Changes to This Policy
We may update this Privacy Policy from time to time. Any changes will be reflected by updating the "Last Updated" date at the top of this policy. We will notify you of material changes through the app or other reasonable means. Continued use of the app after changes constitutes acceptance of the updated policy.

Contact Us
If you have questions about this Privacy Policy or how your data is handled, you can contact us at:

Email: snapit.foranything@gmail.com

By using the Kiwi app, you acknowledge that you have read and understood this Privacy Policy, including the transmission of photos to Rork AI for analysis and the entertainment-only nature of ingredient ratings.`;

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
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  changeThemeMode(option.value);
                }}
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
            <TouchableOpacity
              style={styles.accessibilityToggle}
              onPress={toggleAccessibility}
              activeOpacity={0.7}
            >
              <View style={styles.legalOptionLeft}>
                <Accessibility size={20} color={theme.primary} />
                <View style={styles.switchOptionText}>
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(16) }]}>
                    Text Size
                  </Text>
                  {textSizeMode !== "normal" && (
                    <Text style={[styles.optionDescription, { color: theme.primary, fontSize: scaleFont(12) }]}>
                      {textSizeMode === "medium" ? "Medium" : textSizeMode === "large" ? "Large" : "Extra Large"} active
                    </Text>
                  )}
                </View>
              </View>
              {accessibilityExpanded ? (
                <ChevronDown size={20} color={theme.textSecondary} />
              ) : (
                <ChevronRight size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>

            {accessibilityExpanded && (
              <>
                <View style={[styles.switchOption, { borderTopWidth: 1, borderTopColor: theme.border, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
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
                    onValueChange={(value) => {
                      if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                      changeTextSizeMode(value ? "medium" : "normal");
                    }}
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
                    onValueChange={(value) => {
                      if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                      changeTextSizeMode(value ? "large" : "normal");
                    }}
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
                    onValueChange={(value) => {
                      if (Platform.OS !== "web") { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                      changeTextSizeMode(value ? "extraLarge" : "normal");
                    }}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </>
            )}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            OUR OTHER APPS
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {OTHER_APPS.map((app, index) => (
              <TouchableOpacity
                key={app.id}
                style={[
                  styles.legalOption,
                  index !== OTHER_APPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  Linking.openURL(`https://apps.apple.com/app/id${app.id}`);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.legalOptionLeft}>
                  <Grid3X3 size={18} color={theme.primary} />
                  <Text style={[styles.optionLabel, { color: theme.text, fontSize: scaleFont(15) }]}>
                    {app.name}
                  </Text>
                </View>
                <ExternalLink size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
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

        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Version 2.0.1
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
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
  accessibilityToggle: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
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