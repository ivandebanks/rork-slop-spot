import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { ModalContent } from "../types";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "../constants/legal";
import { styles } from "../styles";

export function LegalModal({
  modalContent,
  setModalContent,
  theme,
  scaleFont,
}: {
  modalContent: ModalContent;
  setModalContent: (c: ModalContent) => void;
  theme: { text: string; background: string; border: string; card: string };
  scaleFont: (n: number) => number;
}) {
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

  return (
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
  );
}
