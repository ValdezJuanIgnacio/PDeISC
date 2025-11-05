import React, { useState, useContext } from "react";
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
  ScrollView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login, googleLogin } = useContext(AuthContext);
  const { signIn: googleSignIn, loading: googleLoading } = useGoogleAuth();

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Limpiar errores
  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  const handleLogin = async () => {
    clearErrors();

    // Validaciones antes de enviar
    let hasError = false;

    if (!email) {
      setEmailError("El correo electrónico es requerido");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Por favor ingresa un correo electrónico válido");
      hasError = true;
    }

    if (!password) {
      setPasswordError("La contraseña es requerida");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 Attempting login with email:", email);

      const result = await login(email, password);

      if (result.success) {
        console.log("✅ Login successful, navigating to Main");
        navigation.replace("Main");
      } else {
        console.log("❌ Login failed:", result.error);

        // Determinar el tipo de error
        const errorMessage = result.error.toLowerCase();

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("no existe") ||
          errorMessage.includes("invalid credentials")
        ) {
          // El email no está registrado
          setEmailError("Este correo no está registrado");
        } else if (
          errorMessage.includes("password") ||
          errorMessage.includes("contraseña") ||
          errorMessage.includes("invalid credentials")
        ) {
          // La contraseña es incorrecta
          setPasswordError("La contraseña es incorrecta");
        } else {
          // Error genérico
          Alert.alert(
            "Error de inicio de sesión",
            result.error || "Credenciales inválidas"
          );
        }
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      Alert.alert("Error", "Ocurrió un error al intentar iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log("🔵 Iniciando Google Sign In...");

      const result = await googleSignIn();

      if (result.success) {
        console.log("✅ Google Sign In exitoso:", result.user);

        // Enviar al backend
        const loginResult = await googleLogin({
          googleId: result.user.id,
          email: result.user.email,
          username: result.user.name,
          profileImage: result.user.photo,
        });

        if (loginResult.success) {
          console.log("✅ Autenticación en backend exitosa");
          navigation.replace("Main");
        } else {
          Alert.alert(
            "Error",
            loginResult.error || "Error al autenticar con el servidor"
          );
        }
      } else if (result.error !== "Cancelled") {
        Alert.alert("Error", "No se pudo iniciar sesión con Google");
      }
    } catch (error) {
      console.error("❌ Google Sign In Error:", error);
      Alert.alert("Error", "Ocurrió un error al iniciar sesión con Google");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Bienvenido a Artemis</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          {/* Campo Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !googleLoading}
            />
            {emailError ? (
              <Text style={styles.errorText}>⚠️ {emailError}</Text>
            ) : null}
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  passwordError && styles.inputError,
                ]}
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading && !googleLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>⚠️ {passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (loading || googleLoading) && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.googleButton,
              (loading || googleLoading) && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>
                  Continuar con Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              disabled={loading || googleLoading}
            >
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "serif",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputError: {
    borderColor: "#F44336",
    borderWidth: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  eyeButton: {
    padding: 15,
  },
  eyeIcon: {
    fontSize: 24,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#999",
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4285F4",
    marginRight: 10,
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#B87D5F",
    fontSize: 14,
    fontWeight: "bold",
  },
});
