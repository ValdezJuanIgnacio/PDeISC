import { useState, useEffect } from "react";
import { Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

// Para móvil (opcional)
let GoogleSignin = null;
try {
  GoogleSignin =
    require("@react-native-google-signin/google-signin").GoogleSignin;
} catch (e) {
  console.log("Google Sign In not available for mobile");
}

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  // ⚠️ CRÍTICO: Especificar redirectUri explícitamente
  // Esto forzará el uso de localhost en lugar de exp.direct
  const redirectUri =
    Platform.OS === "web" ? "http://localhost:8081" : "artemis://redirect";

  console.log("🔐 Redirect URI configurado:", redirectUri);

  // Configuración para web (usando expo-auth-session)
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    redirectUri: redirectUri,
  });

  useEffect(() => {
    if (Platform.OS === "android" || Platform.OS === "ios") {
      // Configurar Google Sign In para móvil
      if (GoogleSignin) {
        const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
        console.log("🔑 Configurando GoogleSignin para móvil");
        console.log("🔑 Web Client ID:", webClientId);

        GoogleSignin.configure({
          webClientId: webClientId, // IMPORTANTE: Usar el Web Client ID, NO el Android Client ID
          offlineAccess: true,
        });

        console.log("✅ GoogleSignin configurado correctamente");
      } else {
        console.error("❌ GoogleSignin no está disponible");
      }
    }
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      handleWebSuccess(response);
    } else if (response?.type === "error") {
      console.error("❌ OAuth error:", response.error);
    }
  }, [response]);

  const handleWebSuccess = async (response) => {
    const { authentication } = response;

    // Obtener información del usuario
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      }
    );

    const userInfo = await userInfoResponse.json();
    return userInfo;
  };

  const signIn = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "web") {
        // Web: Usar expo-auth-session
        console.log("🌐 Iniciando OAuth para web...");
        const result = await promptAsync();

        console.log("📋 Resultado:", result.type);

        if (result.type === "success") {
          const { authentication } = result;

          // Obtener información del usuario
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/userinfo/v2/me",
            {
              headers: {
                Authorization: `Bearer ${authentication.accessToken}`,
              },
            }
          );

          const userInfo = await userInfoResponse.json();

          return {
            success: true,
            user: {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              photo: userInfo.picture,
            },
          };
        } else {
          return { success: false, error: "Cancelled" };
        }
      } else {
        // Móvil: Usar @react-native-google-signin
        console.log("📱 Iniciando Google Sign In para móvil...");

        if (!GoogleSignin) {
          throw new Error("Google Sign In not configured for mobile");
        }

        console.log("🔍 Verificando Google Play Services...");
        await GoogleSignin.hasPlayServices();

        console.log("🚀 Iniciando sign in...");
        const result = await GoogleSignin.signIn();

        console.log("📋 Resultado completo:", JSON.stringify(result, null, 2));

        // IMPORTANTE: La estructura de @react-native-google-signin v16 es diferente
        // Puede ser: result.data.user o result.user dependiendo de la versión
        const user = result.data?.user || result.user;

        if (!user) {
          console.error(
            "❌ No se encontró información del usuario en:",
            result
          );
          throw new Error(
            "No se pudieron obtener los datos del usuario de Google"
          );
        }

        console.log("✅ Usuario obtenido:", user);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            photo: user.photo,
          },
        };
      }
    } catch (error) {
      console.error("❌ Google Sign In Error:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);

      return {
        success: false,
        error: error.message || "Error desconocido",
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (Platform.OS !== "web" && GoogleSignin) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    signIn,
    signOut,
    loading,
  };
};
