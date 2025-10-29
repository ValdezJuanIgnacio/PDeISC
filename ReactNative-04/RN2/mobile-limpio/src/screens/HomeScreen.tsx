import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { getProfile } from "../services/api";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

type HomeScreenRouteProp = RouteProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

export default function HomeScreen({ navigation, route }: Props) {
  const { userId, userName } = route.params;
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [authProvider, setAuthProvider] = useState<string>("local");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await getProfile(userId);
      if (response.success && response.user) {
        setProfilePhoto(response.user.profilePhoto || null);
        setUserEmail(response.user.email || "");
        setAuthProvider(response.user.authProvider || "local");
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleEditProfile = () => {
    navigation.navigate("Profile", { userId });
  };

  const getProviderIcon = () => {
    switch (authProvider) {
      case "google":
        return "🔍";
      case "facebook":
        return "f";
      case "apple":
        return "";
      default:
        return "👤";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header con foto de perfil */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.profilePhotoContainer}
          >
            {profilePhoto ? (
              <Image
                source={{
                  uri: profilePhoto.startsWith("http")
                    ? profilePhoto
                    : `http://192.168.100.86:3000${profilePhoto}`,
                }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Text style={styles.profilePhotoText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.userName}>{userName}</Text>
            {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
            <View style={styles.providerBadge}>
              <Text style={styles.providerIcon}>{getProviderIcon()}</Text>
              <Text style={styles.providerText}>
                {authProvider === "local"
                  ? "Cuenta local"
                  : `Conectado con ${authProvider}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Tarjeta de perfil */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>👤</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Editar Perfil</Text>
            <Text style={styles.cardDescription}>
              Actualiza tu información personal, foto, teléfono y más
            </Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        {/* Otras opciones */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>🔔</Text>
            <Text style={styles.optionText}>Notificaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>⚙️</Text>
            <Text style={styles.optionText}>Configuración</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>❓</Text>
            <Text style={styles.optionText}>Ayuda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>ℹ️</Text>
            <Text style={styles.optionText}>Acerca de</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎉 ¡Todo listo!</Text>
          <Text style={styles.infoText}>
            Has iniciado sesión exitosamente. Ahora puedes:
          </Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>
              ✓ Editar tu perfil y subir una foto
            </Text>
            <Text style={styles.infoItem}>✓ Agregar tu número de teléfono</Text>
            <Text style={styles.infoItem}>✓ Establecer tu ubicación</Text>
            <Text style={styles.infoItem}>✓ Subir documentos de identidad</Text>
          </View>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePhotoContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePhotoText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  editBadgeText: {
    fontSize: 14,
  },
  userInfo: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  providerIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  providerText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  cardArrow: {
    fontSize: 30,
    color: "#ccc",
    fontWeight: "300",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  optionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  infoCard: {
    backgroundColor: "#e7f3ff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  infoList: {
    marginTop: 5,
  },
  infoItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 40,
  },
});
