import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { Button } from "@carbon/react-native";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: any;
  actions?: any;
}

const CustomModal = ({ visible, onClose, title, children, actions }: CustomModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
          {actions && <View style={styles.actionsContainer}>{actions}</View>}
          {actions && !Array.isArray(actions) && (
            <Button onPress={onClose} style={styles.closeButton}>
              Close
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  closeButton: {
    marginTop: 15,
  },
});

export default CustomModal;
