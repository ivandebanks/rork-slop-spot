import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ExternalLink, X } from "lucide-react-native";
import { Citation } from "@/types/scan";
import { openURL } from "../helpers";
import { styles } from "../styles";

export function CitationsModal({
  visible,
  onClose,
  citations,
  title,
  theme,
  scaleFont,
}: {
  visible: boolean;
  onClose: () => void;
  citations: Citation[];
  title: string;
  theme: { text: string; textSecondary: string; surface: string; card: string; primary: string };
  scaleFont: (n: number) => number;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: scaleFont(18) }]}>
              Sources: {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.citationsList}>
            {citations.map((citation, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.citationItem, { backgroundColor: theme.surface }]}
                onPress={() => openURL(citation.url)}
              >
                <View style={styles.citationTextContainer}>
                  <Text style={[styles.citationSource, { color: theme.primary, fontSize: scaleFont(12) }]}>
                    {citation.source}
                  </Text>
                  <Text style={[styles.citationTitle, { color: theme.text, fontSize: scaleFont(14) }]}>
                    {citation.title}
                  </Text>
                  <Text style={[styles.citationUrl, { color: theme.textSecondary, fontSize: scaleFont(12) }]} numberOfLines={1}>
                    {citation.url}
                  </Text>
                </View>
                <ExternalLink size={16} color={theme.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { fontSize: scaleFont(16) }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
