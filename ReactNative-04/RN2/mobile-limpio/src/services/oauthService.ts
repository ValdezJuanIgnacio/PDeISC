import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import React from "react";

WebBrowser.maybeCompleteAuthSession();

// ✅ CREDENCIALES DE GOOGLE OAUTH
export const GOOGLE_CONFIG = {
  expoClientId:
    "161972850103-68m9tjg4fds3b174s925josilhogf6k2.apps.googleusercontent.com",
  iosClientId:
    "161972850103-64000rekra9pka93invj0a3zl9qf35lc.apps.googleusercontent.com",
  androidClientId:
    "161972850103-4ciqp0ktntkuh4a57po5eorj36re8d0l.apps.googleusercontent.com",
  webClientId:
    "161972850103-68m9tjg4fds3b174s925josjjhogf6k2.apps.googleusercontent.com",
};

// ConfiguraciÃ³n de Facebook OAuth
export const FACEBOOK_CONFIG = {
  appId: "TU_FACEBOOK_APP_ID",
};

// Hook para Google Sign In (Compatible con Web + Mobile)
export const useGoogleAuth = () => {
  // Detectar si estamos en web
  const isWeb = Platform.OS === "web";

  // SIEMPRE usar el proxy de Expo para evitar problemas
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "myapp",
    path: undefined,
  });

  console.log("🔗 Redirect URI configurada:", redirectUri);
  console.log("📱 Plataforma:", Platform.OS);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId, // Usar webClientId explícitamente
    scopes: ["profile", "email"],
    redirectUri: redirectUri,
  });

  // Mostrar estado del request
  React.useEffect(() => {
    if (request) {
      console.log("✅ Request OAuth listo");
      console.log("📍 Redirect URI final:", request.redirectUri);
      console.log("🔑 Client ID usado:", GOOGLE_CONFIG.webClientId);
    }
  }, [request]);

  return { request, response, promptAsync };
};

// Hook para Facebook Sign In
export const useFacebookAuth = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_CONFIG.appId,
    scopes: ["public_profile", "email"],
  });

  return { request, response, promptAsync };
};

// FunciÃ³n para Google Sign In
export const signInWithGoogle = async (
  promptAsync: any
): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  };
  error?: string;
}> => {
  try {
    console.log("🔵 Iniciando Google Sign In...");
    console.log("📱 Plataforma:", Platform.OS);

    // En web, usar showInRecents para evitar problemas de pop-ups
    const options =
      Platform.OS === "web"
        ? { windowFeatures: { width: 600, height: 600 } }
        : {};

    const result = await promptAsync(options);

    console.log("📱 Resultado de Google:", result.type);

    if (result.type === "success") {
      const { authentication } = result;

      if (!authentication?.accessToken) {
        return {
          success: false,
          error: "No se obtuvo token de acceso",
        };
      }

      console.log("🔑 Token obtenido, consultando perfil...");

      // Obtener información del usuario de Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: {
            Authorization: `Bearer ${authentication.accessToken}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error("Error al obtener información del usuario");
      }

      const userInfo = await userInfoResponse.json();
      console.log("✅ Perfil de Google obtenido:", userInfo.email);

      return {
        success: true,
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture,
        },
      };
    } else if (result.type === "cancel" || result.type === "dismiss") {
      console.log("❌ Usuario canceló la autenticación o pop-up bloqueado");
      return {
        success: false,
        error:
          "Autenticación cancelada. Si usas Chrome, permite pop-ups para localhost.",
      };
    }

    return {
      success: false,
      error: "Autenticación no completada",
    };
  } catch (error: any) {
    console.error("❌ Error en Google Sign In:", error);
    return {
      success: false,
      error: error.message || "Error desconocido en Google Sign In",
    };
  }
};

// FunciÃ³n para Facebook Sign In
export const signInWithFacebook = async (
  promptAsync: any
): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  };
  error?: string;
}> => {
  try {
    console.log("🔵 Iniciando Facebook Sign In...");
    const result = await promptAsync();

    console.log("📱 Resultado de Facebook:", result.type);

    if (result.type === "success") {
      const { authentication } = result;

      if (!authentication?.accessToken) {
        return {
          success: false,
          error: "No se obtuvo token de acceso",
        };
      }

      console.log("🔑 Token obtenido, consultando perfil...");

      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?access_token=${authentication.accessToken}&fields=id,name,email,picture.type(large)`
      );

      if (!userInfoResponse.ok) {
        throw new Error("Error al obtener información del usuario");
      }

      const userInfo = await userInfoResponse.json();
      console.log("✅ Perfil de Facebook obtenido:", userInfo.email);

      return {
        success: true,
        user: {
          id: userInfo.id,
          email: userInfo.email || `${userInfo.id}@facebook.com`,
          name: userInfo.name,
          photo: userInfo.picture?.data?.url,
        },
      };
    } else if (result.type === "cancel" || result.type === "dismiss") {
      console.log("❌ Usuario canceló la autenticación");
      return {
        success: false,
        error: "Autenticación cancelada por el usuario",
      };
    }

    return {
      success: false,
      error: "Autenticación no completada",
    };
  } catch (error: any) {
    console.error("❌ Error en Facebook Sign In:", error);
    return {
      success: false,
      error: error.message || "Error desconocido en Facebook Sign In",
    };
  }
};

// FunciÃ³n para Apple Sign In (solo iOS 13+)
export const signInWithApple = async (): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}> => {
  try {
    console.log("🍎 Iniciando Apple Sign In...");

    // Verificar disponibilidad
    const isAvailable = await AppleAuthentication.isAvailableAsync();

    if (!isAvailable) {
      console.log("❌ Apple Sign In no disponible");
      return {
        success: false,
        error: "Apple Sign In no está disponible en este dispositivo",
      };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log("✅ Credencial de Apple obtenida");

    const name =
      credential.fullName?.givenName && credential.fullName?.familyName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
        : "Usuario de Apple";

    const email =
      credential.email || `${credential.user}@privaterelay.appleid.com`;

    return {
      success: true,
      user: {
        id: credential.user,
        email: email,
        name: name,
      },
    };
  } catch (error: any) {
    console.error("❌ Error en Apple Sign In:", error);

    if (error.code === "ERR_CANCELED") {
      return {
        success: false,
        error: "Autenticación cancelada por el usuario",
      };
    }

    return {
      success: false,
      error: error.message || "Error desconocido en Apple Sign In",
    };
  }
};

// Verificar si Apple Sign In estÃ¡ disponible
export const isAppleAuthAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== "ios") {
    console.log("ℹ️ Apple Sign In solo disponible en iOS");
    return false;
  }

  try {
    const available = await AppleAuthentication.isAvailableAsync();
    console.log(`ℹ️ Apple Sign In disponible: ${available}`);
    return available;
  } catch (error) {
    console.error("Error verificando Apple Auth:", error);
    return false;
  }
};

// Utilidad para obtener información del token de Google
export const getGoogleUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Error al obtener información del usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo info de usuario Google:", error);
    throw error;
  }
};

// Utilidad para obtener información del token de Facebook
export const getFacebookUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture.type(large)`
    );

    if (!response.ok) {
      throw new Error("Error al obtener información del usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo info de usuario Facebook:", error);
    throw error;
  }
};
