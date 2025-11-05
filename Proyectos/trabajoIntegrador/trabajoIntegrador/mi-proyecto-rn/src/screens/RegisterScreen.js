import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de error
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const { register } = useContext(AuthContext);

  // Validar username
  const validateUsername = (username) => {
    // No puede contener solo números
    const onlyNumbers = /^\d+$/;
    if (onlyNumbers.test(username)) {
      return "El nombre no puede contener solo números";
    }
    // Mínimo 3 caracteres
    if (username.length < 3) {
      return "El nombre debe tener al menos 3 caracteres";
    }
    // Máximo 50 caracteres
    if (username.length > 50) {
      return "El nombre es demasiado largo (máximo 50 caracteres)";
    }
    return "";
  };

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Por favor ingresa un correo electrónico válido";
    }
    return "";
  };

  // Validar contraseña
  const validatePassword = (password) => {
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (password.length > 20) {
      return "La contraseña no puede tener más de 20 caracteres";
    }
    // Opcional: Verificar que tenga al menos una letra y un número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter) {
      return "La contraseña debe contener al menos una letra";
    }

    return "";
  };

  // Limpiar errores
  const clearErrors = () => {
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const handleRegister = async () => {
    console.log("🔵 Register button pressed");
    clearErrors();

    // Validaciones
    let hasError = false;

    // Validar username
    if (!username) {
      setUsernameError("El nombre de usuario es requerido");
      hasError = true;
    } else {
      const usernameValidation = validateUsername(username);
      if (usernameValidation) {
        setUsernameError(usernameValidation);
        hasError = true;
      }
    }

    // Validar email
    if (!email) {
      setEmailError("El correo electrónico es requerido");
      hasError = true;
    } else {
      const emailValidation = validateEmail(email);
      if (emailValidation) {
        setEmailError(emailValidation);
        hasError = true;
      }
    }

    // Validar contraseña
    if (!password) {
      setPasswordError("La contraseña es requerida");
      hasError = true;
    } else {
      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        setPasswordError(passwordValidation);
        hasError = true;
      }
    }

    // Validar confirmación de contraseña
    if (!confirmPassword) {
      setConfirmPasswordError("Debes confirmar tu contraseña");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      hasError = true;
    }

    if (hasError) {
      console.log("❌ Validation failed");
      return;
    }

    console.log("✅ Validations passed");
    console.log("📝 Register data:", { username, email });

    setLoading(true);
    try {
      console.log("🚀 Calling register function...");
      // El rol siempre será 'writer'
      const result = await register(username, email, password, "writer");
      console.log("📥 Register result:", result);

      if (!result.success) {
        console.log("❌ Register failed:", result.error);

        // Determinar qué campo tiene el error
        const errorMessage = result.error.toLowerCase();

        if (
          errorMessage.includes("email") ||
          errorMessage.includes("correo") ||
          errorMessage.includes("already registered")
        ) {
          setEmailError("Este correo ya está registrado");
        } else if (
          errorMessage.includes("username") ||
          errorMessage.includes("usuario")
        ) {
          setUsernameError("Este nombre de usuario ya existe");
        } else {
          Alert.alert(
            "Error",
            result.error || "No se pudo completar el registro"
          );
        }
      } else {
        console.log("✅ Register successful!");
        // La navegación se maneja automáticamente en AuthContext
      }
    } catch (error) {
      console.error("💥 Register exception:", error);
      Alert.alert("Error", "Ocurrió un error inesperado: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Artemis</Text>
        <Text style={styles.subtitle}>Crea tu cuenta de escritor</Text>

        {/* Campo Nombre de Usuario */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, usernameError && styles.inputError]}
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setUsernameError("");
            }}
            autoCapitalize="words"
            editable={!loading}
          />
          {usernameError ? (
            <Text style={styles.errorText}>⚠️ {usernameError}</Text>
          ) : (
            <Text style={styles.helperText}>
              Mínimo 3 caracteres, no solo números
            </Text>
          )}
        </View>

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
            editable={!loading}
          />
          {emailError ? (
            <Text style={styles.errorText}>⚠️ {emailError}</Text>
          ) : (
            <Text style={styles.helperText}>ejemplo@correo.com</Text>
          )}
        </View>

        {/* Campo Contraseña */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, passwordError && styles.inputError]}
              placeholder="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError("");
              }}
              secureTextEntry={!showPassword}
              editable={!loading}
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
          ) : (
            <Text style={styles.helperText}>
              6-20 caracteres, letras, números y caracteres especiales
            </Text>
          )}
        </View>

        {/* Campo Confirmar Contraseña */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                confirmPasswordError && styles.inputError,
              ]}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError("");
              }}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </Text>
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>⚠️ {confirmPasswordError}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse como Escritor</Text>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={styles.loadingText}>Procesando registro...</Text>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          disabled={loading}
        >
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
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
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "serif",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
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
  helperText: {
    color: "#999",
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
    backgroundColor: "#D4A89A",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    fontSize: 14,
  },
  link: {
    textAlign: "center",
    color: "#B87D5F",
    marginTop: 15,
    fontSize: 14,
  },
});
