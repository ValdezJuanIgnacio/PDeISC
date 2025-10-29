import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { login, oauthLogin } from "../services/api";
import {
  useGoogleAuth,
  useFacebookAuth,
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
  isAppleAuthAvailable,
} from "../services/oauthService";
import axios from "axios";

const API_URL = "http://192.168.100.86:3000/api";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <View style={styles.eyeSvg}>
    {visible ? (
      <View>
        <View style={styles.eyeOuter} />
        <View style={styles.eyeInner} />
      </View>
    ) : (
      <View>
        <View style={styles.eyeOuter} />
        <View style={styles.eyeInner} />
        <View style={styles.eyeSlash} />
      </View>
    )}
  </View>
);

export default function LoginScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Hooks de OAuth
  const { promptAsync: googlePrompt } = useGoogleAuth();
  const { promptAsync: facebookPrompt } = useFacebookAuth();

  useEffect(() => {
    checkAppleAvailability();
  }, []);

  const checkAppleAvailability = async () => {
    const available = await isAppleAuthAvailable();
    setAppleAvailable(available);
  };

  const handleLogin = async () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await login({ name, password });

      if (response.success && response.user) {
        navigation.replace("Home", {
          userId: response.user.id,
          userName: response.user.name,
        });
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle(googlePrompt);

      if (result.success && result.user) {
        const oauthResponse = await oauthLogin({
          provider: "google",
          providerId: result.user.id,
          email: result.user.email,
          name: result.user.name,
          profilePhoto: result.user.photo,
        });

        if (oauthResponse.success && oauthResponse.user) {
          navigation.replace("Home", {
            userId: oauthResponse.user.id,
            userName: oauthResponse.user.name,
          });
        } else {
          Alert.alert("Error", oauthResponse.message);
        }
      } else {
        Alert.alert("Error", result.error || "Error al autenticar con Google");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithFacebook(facebookPrompt);

      if (result.success && result.user) {
        const oauthResponse = await oauthLogin({
          provider: "facebook",
          providerId: result.user.id,
          email: result.user.email,
          name: result.user.name,
          profilePhoto: result.user.photo,
        });

        if (oauthResponse.success && oauthResponse.user) {
          navigation.replace("Home", {
            userId: oauthResponse.user.id,
            userName: oauthResponse.user.name,
          });
        } else {
          Alert.alert("Error", oauthResponse.message);
        }
      } else {
        Alert.alert(
          "Error",
          result.error || "Error al autenticar con Facebook"
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithApple();

      if (result.success && result.user) {
        const oauthResponse = await oauthLogin({
          provider: "apple",
          providerId: result.user.id,
          email: result.user.email,
          name: result.user.name,
        });

        if (oauthResponse.success && oauthResponse.user) {
          navigation.replace("Home", {
            userId: oauthResponse.user.id,
            userName: oauthResponse.user.name,
          });
        } else {
          Alert.alert("Error", oauthResponse.message);
        }
      } else {
        Alert.alert("Error", result.error || "Error al autenticar con Apple");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminName.trim() || !adminPassword.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setAdminLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/login`, {
        name: adminName,
        password: adminPassword,
      });

      if (response.data.success && response.data.user) {
        setShowAdminModal(false);
        navigation.replace("AdminPanel", {
          adminId: response.data.user.id,
          adminName: response.data.user.name,
        });
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Credenciales incorrectas"
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const openAdminModal = () => {
    setAdminName("");
    setAdminPassword("");
    setShowAdminModal(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Admin Access Button */}
        <TouchableOpacity
          style={styles.adminAccessButton}
          onPress={openAdminModal}
        >
          <Text style={styles.adminAccessText}>🔐 Acceso Administrador</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
          editable={!loading}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <EyeIcon visible={showPassword} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>O continúa con</Text>
          <View style={styles.divider} />
        </View>

        {/* OAuth Buttons */}
        <View style={styles.oauthContainer}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <View style={styles.oauthIconContainer}>
              <Text style={styles.oauthIcon}>🔴</Text>
            </View>
            <Text style={styles.oauthButtonText}>Google</Text>
          </TouchableOpacity>
e        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            ¿No tienes cuenta? Regístrate aquí
          </Text>
        </TouchableOpacity>
      </View>

      {/* Admin Login Modal */}
      <Modal
        visible={showAdminModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Acceso Administrador</Text>
              <TouchableOpacity
                onPress={() => setShowAdminModal(false)}
                disabled={adminLoading}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.adminIconContainer}>
              <Text style={styles.adminIcon}>👤</Text>
            </View>

            <Text style={styles.adminWarning}>⚠️ Solo personal autorizado</Text>

            <TextInput
              style={styles.input}
              placeholder="Usuario administrador"
              value={adminName}
              onChangeText={setAdminName}
              autoCapitalize="none"
              editable={!adminLoading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña de administrador"
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry={true}
                editable={!adminLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                styles.adminButton,
                adminLoading && styles.buttonDisabled,
              ]}
              onPress={handleAdminLogin}
              disabled={adminLoading}
            >
              {adminLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Acceder al Panel</Text>
              )}
            </TouchableOpacity>

            <View style={styles.adminInfo}>
              <Text style={styles.adminInfoText}>
                Usuario por defecto: admin
              </Text>
              <Text style={styles.adminInfoText}>Contraseña: admin123</Text>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  adminAccessButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#dc3545",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  adminAccessText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeSvg: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeOuter: {
    width: 24,
    height: 14,
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 12,
    position: "absolute",
  },
  eyeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    position: "absolute",
    top: 3,
    left: 8,
  },
  eyeSlash: {
    width: 28,
    height: 2,
    backgroundColor: "#666",
    position: "absolute",
    top: 6,
    left: -2,
    transform: [{ rotate: "45deg" }],
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#666",
    fontSize: 14,
  },
  oauthContainer: {
    gap: 12,
    marginBottom: 20,
  },
  oauthButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appleButton: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  oauthIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  oauthIcon: {
    fontSize: 24,
  },
  oauthButtonText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  appleButtonText: {
    color: "#fff",
  },
  linkText: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalClose: {
    fontSize: 24,
    color: "#999",
    fontWeight: "bold",
  },
  adminIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
  },
  adminIcon: {
    fontSize: 40,
    color: "#fff",
  },
  adminWarning: {
    textAlign: "center",
    fontSize: 14,
    color: "#dc3545",
    marginBottom: 20,
    fontWeight: "600",
  },
  adminButton: {
    backgroundColor: "#dc3545",
  },
  adminInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },
  adminInfoText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 2,
  },
});
