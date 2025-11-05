import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getToken,
  storeToken,
  removeToken,
  getUser,
  storeUser,
} from "../utils/storage";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication...");
      const token = await getToken();
      const userData = await getUser();

      if (token && userData) {
        console.log("✅ User authenticated:", userData.email);
        setUser(userData);
      } else {
        console.log("❌ No authentication found");
        setUser(null);
      }
    } catch (error) {
      console.error("💥 Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login for:", email);
      const response = await authAPI.login({ email, password });

      console.log("📥 Login response:", response.data);

      await storeToken(response.data.token);
      await storeUser(response.data.user);
      setUser(response.data.user);

      console.log("✅ Login successful");
      return { success: true };
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("Error response:", error.response?.data);

      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      console.log("🔐 Attempting registration:", { username, email, role });

      const registerData = {
        username,
        email,
        password,
        role,
      };

      console.log("📤 Sending registration request...");
      const response = await authAPI.register(registerData);

      console.log("📥 Registration response:", response.data);

      if (response.data && response.data.token && response.data.user) {
        console.log("💾 Storing token and user data...");
        await storeToken(response.data.token);
        await storeUser(response.data.user);
        setUser(response.data.user);

        console.log("✅ Registration successful!");
        return { success: true };
      } else {
        console.error("❌ Invalid response structure:", response.data);
        return {
          success: false,
          error: "Respuesta inválida del servidor",
        };
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = "Registration failed";

      if (error.response) {
        errorMessage =
          error.response.data?.message || `Error ${error.response.status}`;
      } else if (error.request) {
        errorMessage =
          "No se pudo conectar con el servidor. Verifica tu conexión.";
      } else {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      console.log("🔐 Attempting Google login");
      const response = await authAPI.googleAuth(googleData);

      console.log("📥 Google login response:", response.data);

      await storeToken(response.data.token);
      await storeUser(response.data.user);
      setUser(response.data.user);

      console.log("✅ Google login successful");
      return { success: true };
    } catch (error) {
      console.error("❌ Google login error:", error);
      console.error("Error response:", error.response?.data);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Google login failed",
      };
    }
  };

  const logout = async () => {
    try {
      console.log("👋 Iniciando logout...");
      console.log("🔍 Usuario actual:", user?.email);

      // Paso 1: Remover token
      console.log("🗑️ Eliminando token...");
      await removeToken();

      // Paso 2: Remover datos del usuario
      console.log("🗑️ Eliminando datos de usuario...");
      await AsyncStorage.removeItem("userData");

      // Paso 3: Limpiar cualquier otro dato relacionado
      const allKeys = await AsyncStorage.getAllKeys();
      console.log("🔑 Keys en storage:", allKeys);

      // Opcional: limpiar borradores
      await AsyncStorage.removeItem("chapter_draft");

      // Paso 4: Actualizar el estado
      console.log("♻️ Actualizando estado a null...");
      setUser(null);

      console.log("✅ Logout completado exitosamente");
      return { success: true };
    } catch (error) {
      console.error("💥 Error en logout:", error);
      console.error("Stack trace:", error.stack);

      // CRÍTICO: Incluso si hay error, limpiamos el estado
      setUser(null);

      return {
        success: false,
        error: error.message,
      };
    }
  };

  // ✅ NUEVA FUNCIÓN - Actualizar usuario en el contexto
  const updateUser = async (updatedUserData) => {
    try {
      console.log("🔄 Actualizando usuario en contexto:", updatedUserData);

      // Combinar datos actuales con los nuevos
      const newUserData = { ...user, ...updatedUserData };

      // Actualizar en AsyncStorage
      await storeUser(newUserData);

      // Actualizar estado
      setUser(newUserData);

      console.log("✅ Usuario actualizado en contexto");
      return { success: true };
    } catch (error) {
      console.error("❌ Error actualizando usuario:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateUser, // ✅ Nueva función exportada
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
