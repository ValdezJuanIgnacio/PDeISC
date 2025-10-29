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
  const [role, setRole] = useState("reader");
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    console.log("🔵 Register button pressed");

    // Validaciones
    if (!username || !email || !password || !confirmPassword) {
      console.log("❌ Validation failed: Empty fields");
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      console.log("❌ Validation failed: Passwords don't match");
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    console.log("✅ Validations passed");
    console.log("📝 Register data:", { username, email, role });

    setLoading(true);
    try {
      console.log("🚀 Calling register function...");
      const result = await register(username, email, password, role);
      console.log("📥 Register result:", result);

      if (!result.success) {
        console.log("❌ Register failed:", result.error);
        Alert.alert(
          "Error",
          result.error || "No se pudo completar el registro"
        );
      } else {
        console.log("✅ Register successful!");
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
      <Text style={styles.title}>Artemis</Text>
      <Text style={styles.subtitle}>Crea tu cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={(text) => {
          console.log("Username changed:", text);
          setUsername(text);
        }}
        autoCapitalize="words"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          console.log("Email changed:", text);
          setEmail(text);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={(text) => {
          console.log("Password changed:", text.length, "chars");
          setPassword(text);
        }}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={(text) => {
          console.log("Confirm password changed:", text.length, "chars");
          setConfirmPassword(text);
        }}
        secureTextEntry
        editable={!loading}
      />

      <Text style={styles.label}>Selecciona tu rol:</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "reader" && styles.roleButtonActive,
          ]}
          onPress={() => {
            console.log("Role changed to: reader");
            setRole("reader");
          }}
          disabled={loading}
        >
          <Text
            style={[
              styles.roleText,
              role === "reader" && styles.roleTextActive,
            ]}
          >
            Lector
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "writer" && styles.roleButtonActive,
          ]}
          onPress={() => {
            console.log("Role changed to: writer");
            setRole("writer");
          }}
          disabled={loading}
        >
          <Text
            style={[
              styles.roleText,
              role === "writer" && styles.roleTextActive,
            ]}
          >
            Escritor
          </Text>
        </TouchableOpacity>
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
          <Text style={styles.buttonText}>Registrarse</Text>
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
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
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
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
    fontWeight: "600",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 5,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#B87D5F",
  },
  roleText: {
    fontSize: 16,
    color: "#666",
  },
  roleTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
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
    marginBottom: 10,
    fontSize: 14,
  },
  link: {
    textAlign: "center",
    color: "#B87D5F",
    marginTop: 15,
    fontSize: 14,
  },
});
