import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";

export const CustomAlert = ({
  visible,
  onClose,
  title,
  message,
  type = "info", // 'success', 'error', 'warning', 'info'
  buttons = [{ text: "OK", onPress: onClose }],
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <View style={[styles.iconContainer, styles.successBg]}>
            <Text style={styles.iconText}>✓</Text>
          </View>
        );
      case "error":
        return (
          <View style={[styles.iconContainer, styles.errorBg]}>
            <Text style={styles.iconText}>✕</Text>
          </View>
        );
      case "warning":
        return (
          <View style={[styles.iconContainer, styles.warningBg]}>
            <Text style={styles.iconText}>!</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, styles.infoBg]}>
            <Text style={styles.iconText}>i</Text>
          </View>
        );
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertContainer, { opacity: fadeAnim }]}>
          {getIcon()}

          <Text style={styles.title}>{title}</Text>

          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === "cancel" && styles.cancelButton,
                  buttons.length === 1 && styles.singleButton,
                ]}
                onPress={() => {
                  button.onPress?.();
                  if (button.style !== "cancel") {
                    onClose();
                  }
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.cancelButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successBg: {
    backgroundColor: "#4CAF50",
  },
  errorBg: {
    backgroundColor: "#F44336",
  },
  warningBg: {
    backgroundColor: "#FF9800",
  },
  infoBg: {
    backgroundColor: "#B87D5F",
  },
  iconText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#B87D5F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  singleButton: {
    flex: 0,
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  cancelButtonText: {
    color: "#666",
  },
});
