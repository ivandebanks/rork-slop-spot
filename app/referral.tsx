import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Copy, Share2, Gift, Users, Crown, Clock, CheckCircle, Send } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useReferral } from "@/contexts/ReferralContext";
import * as Haptics from "expo-haptics";

export default function ReferralScreen() {
  const { theme, scaleFont } = useTheme();
  const {
    referralCount,
    hasReferralPremium,
    getMyInviteCode,
    redeemInviteCode,
    redeemConfirmationCode,
    getReferralPremiumDaysLeft,
  } = useReferral();

  const [inputCode, setInputCode] = useState("");
  const [confirmationCodeToShow, setConfirmationCodeToShow] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isDark = theme.background === "#121212";

  const myInviteCode = getMyInviteCode();

  const handleShareCode = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({
        message: `Try Kiwi - the health scanner app! Use my referral code when you sign up:\n\n${myInviteCode}\n\nWe both get Premium when you join!`,
      });
    } catch {}
  };

  const handleCopyCode = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({ message: myInviteCode });
    } catch {}
  };

  const handleCopyConfirmation = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({ message: confirmationCodeToShow });
    } catch {}
  };

  const handleRedeemCode = async () => {
    if (!inputCode.trim()) return;
    setIsProcessing(true);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const code = inputCode.trim().toUpperCase();

    // Try as invite code first (KW- prefix)
    if (code.startsWith("KW-")) {
      const result = await redeemInviteCode(code);
      if ("error" in result) {
        Alert.alert("Error", result.error);
      } else {
        setConfirmationCodeToShow(result.confirmationCode);
        Alert.alert(
          "Referral Accepted!",
          "A confirmation code has been generated. Copy it and send it back to your friend so they get credit too!",
        );
      }
    }
    // Try as confirmation code (KC- prefix)
    else if (code.startsWith("KC-")) {
      const result = await redeemConfirmationCode(code);
      if ("error" in result) {
        Alert.alert("Error", result.error);
      } else {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert(
          "Referral Confirmed!",
          `You now have ${result.newCount} referral${result.newCount !== 1 ? "s" : ""}! ${
            result.newCount >= 5
              ? "You earned 1 month of Premium!"
              : result.newCount >= 2
                ? "You earned 1 week of Premium!"
                : `Get ${2 - result.newCount} more for a week of Premium.`
          }`,
        );
      }
    } else {
      Alert.alert("Invalid Code", "Referral codes start with KW- and confirmation codes start with KC-.");
    }

    setInputCode("");
    setIsProcessing(false);
  };

  const progressToWeek = Math.min(referralCount / 2, 1);
  const progressToMonth = Math.min(referralCount / 5, 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: scaleFont(20) }]}>
          Refer Friends
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        {/* Status card */}
        {hasReferralPremium && (
          <View style={[styles.premiumActiveCard, { backgroundColor: isDark ? "#1C1A14" : "#FFFDF5" }]}>
            <Crown size={20} color="#D4AF37" fill="#D4AF37" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.premiumActiveTitle, { color: theme.text, fontSize: scaleFont(15) }]}>
                Referral Premium Active
              </Text>
              <Text style={[styles.premiumActiveSub, { color: theme.textSecondary, fontSize: scaleFont(12) }]}>
                {getReferralPremiumDaysLeft()} days remaining
              </Text>
            </View>
            <Clock size={16} color="#D4AF37" />
          </View>
        )}

        {/* Your Code */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Share2 size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(16) }]}>
              Your Referral Code
            </Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Share this code with friends. It expires in 2 days, so share it soon!
          </Text>

          <View style={[styles.codeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.codeText, { color: theme.text, fontSize: scaleFont(14) }]} selectable>
              {myInviteCode}
            </Text>
          </View>

          <View style={styles.codeActions}>
            <TouchableOpacity style={[styles.codeActionBtn, { backgroundColor: theme.primary }]} onPress={handleCopyCode}>
              <Copy size={16} color="#FFFFFF" />
              <Text style={[styles.codeActionText, { fontSize: scaleFont(14) }]}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.codeActionBtn, { backgroundColor: "#06D6A0" }]} onPress={handleShareCode}>
              <Send size={16} color="#FFFFFF" />
              <Text style={[styles.codeActionText, { fontSize: scaleFont(14) }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enter Code */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Gift size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(16) }]}>
              Enter a Code
            </Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
            Paste a friend's referral code (KW-...) or a confirmation code (KC-...) they sent back.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.codeInput, {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
                fontSize: scaleFont(14),
              }]}
              value={inputCode}
              onChangeText={setInputCode}
              placeholder="Paste code here..."
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.redeemBtn, { backgroundColor: theme.primary, opacity: inputCode.trim() && !isProcessing ? 1 : 0.5 }]}
              onPress={handleRedeemCode}
              disabled={!inputCode.trim() || isProcessing}
            >
              <CheckCircle size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmation code to send back */}
        {confirmationCodeToShow !== "" && (
          <View style={[styles.sectionCard, { backgroundColor: isDark ? "#0A2A1A" : "#F0FDF4", borderColor: "#06D6A0", borderWidth: 1 }]}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={18} color="#06D6A0" />
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(16) }]}>
                Send This Back
              </Text>
            </View>
            <Text style={[styles.sectionDesc, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
              Copy this confirmation code and send it back to your friend so they get referral credit.
            </Text>
            <View style={[styles.codeBox, { backgroundColor: theme.surface, borderColor: "#06D6A0" }]}>
              <Text style={[styles.codeText, { color: theme.text, fontSize: scaleFont(14) }]} selectable>
                {confirmationCodeToShow}
              </Text>
            </View>
            <TouchableOpacity style={[styles.codeActionBtn, { backgroundColor: "#06D6A0", alignSelf: "stretch" }]} onPress={handleCopyConfirmation}>
              <Copy size={16} color="#FFFFFF" />
              <Text style={[styles.codeActionText, { fontSize: scaleFont(14) }]}>Copy Confirmation Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Users size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(16) }]}>
              Your Progress
            </Text>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.text, fontSize: scaleFont(14) }]}>
                1 Week Premium
              </Text>
              <Text style={[styles.progressCount, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                {Math.min(referralCount, 2)}/2 referrals
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.surface }]}>
              <View style={[styles.progressBarFill, { width: `${progressToWeek * 100}%`, backgroundColor: "#06D6A0" }]} />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.text, fontSize: scaleFont(14) }]}>
                1 Month Premium
              </Text>
              <Text style={[styles.progressCount, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                {Math.min(referralCount, 5)}/5 referrals
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.surface }]}>
              <View style={[styles.progressBarFill, { width: `${progressToMonth * 100}%`, backgroundColor: "#D4AF37" }]} />
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaleFont(16), marginBottom: 12 }]}>
            How It Works
          </Text>
          {[
            { step: "1", text: "Share your referral code (KW-...) with a friend" },
            { step: "2", text: "They download Kiwi and enter your code here" },
            { step: "3", text: "They get a confirmation code (KC-...) to send back to you" },
            { step: "4", text: "You enter that confirmation code to count the referral" },
            { step: "5", text: "2 referrals = 1 week Premium, 5 referrals = 1 month Premium" },
          ].map((item) => (
            <View key={item.step} style={styles.howItWorksRow}>
              <View style={[styles.stepCircle, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepText}>{item.step}</Text>
              </View>
              <Text style={[styles.stepDesc, { color: theme.textSecondary, fontSize: scaleFont(13) }]}>
                {item.text}
              </Text>
            </View>
          ))}
          <View style={styles.expiryNote}>
            <Clock size={12} color={theme.textSecondary} />
            <Text style={[styles.expiryText, { color: theme.textSecondary, fontSize: scaleFont(11) }]}>
              All codes expire after 2 days
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scrollContent: { flex: 1 },
  scrollInner: { paddingHorizontal: 20, gap: 16, paddingTop: 8 },

  premiumActiveCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  premiumActiveTitle: { fontWeight: "600" },
  premiumActiveSub: {},

  sectionCard: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontWeight: "700" },
  sectionDesc: { lineHeight: 18 },

  codeBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  codeText: { fontWeight: "600", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", textAlign: "center" },

  codeActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  codeActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  codeActionText: { color: "#FFFFFF", fontWeight: "600" },

  inputRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  redeemBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  progressItem: { gap: 6, marginTop: 4 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontWeight: "600" },
  progressCount: {},
  progressBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },

  howItWorksRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", marginTop: 1 },
  stepText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  stepDesc: { flex: 1, lineHeight: 18 },
  expiryNote: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, opacity: 0.7 },
  expiryText: {},
});
