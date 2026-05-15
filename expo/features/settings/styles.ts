import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
  appIconImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    alignItems: "center" as const,
  },
  signOutButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "700" as const,
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
