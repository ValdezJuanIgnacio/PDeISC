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

  // Configuración para web (usando expo-auth-session)
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
  });

  useEffect(() => {
    if (Platform.OS === "android" || Platform.OS === "ios") {
      // Configurar Google Sign In para móvil
      if (GoogleSignin) {
        GoogleSignin.configure({
          webClientId: Constants.expoConfig?.extra?.googleWebClientId,
          iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
          offlineAccess: true,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      handleWebSuccess(response);
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
        const result = await promptAsync();

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
        if (!GoogleSignin) {
          throw new Error("Google Sign In not configured for mobile");
        }

        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        return {
          success: true,
          user: {
            id: userInfo.user.id,
            email: userInfo.user.email,
            name: userInfo.user.name,
            photo: userInfo.user.photo,
          },
        };
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
      return {
        success: false,
        error: error.message,
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
