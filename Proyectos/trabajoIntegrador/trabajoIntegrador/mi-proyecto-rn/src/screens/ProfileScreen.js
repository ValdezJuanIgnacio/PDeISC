import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { authAPI, booksAPI } from "../services/api";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);

  // Estados generales
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  // Estados de edición
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [profileStats, setProfileStats] = useState(null);

  // Estados para las secciones
  const [activeSection, setActiveSection] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loadingSection, setLoadingSection] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileStats();
    }
  }, [user]);

  // ✅ Si no hay usuario, mostrar pantalla de visitante
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.guestImage}
          />
          <Text style={styles.guestTitle}>Modo Visitante</Text>
          <Text style={styles.guestSubtitle}>
            Inicia sesión para acceder a todas las funciones
          </Text>

          <View style={styles.guestFeatures}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureText}>
                Guarda tus libros favoritos
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Comenta y participa</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✏️</Text>
              <Text style={styles.featureText}>
                Escribe tus propias historias
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💚</Text>
              <Text style={styles.featureText}>
                Dale like a tus capítulos favoritos
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.guestLoginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.guestLoginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestRegisterButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.guestRegisterButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ✅ Cargar estadísticas del perfil - SOLO LIBROS PUBLICADOS
  const loadProfileStats = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.user.stats) {
        setProfileStats(response.data.user.stats);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  // Función para editar nombre de usuario
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "El nombre de usuario no puede estar vacío");
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.updateUsername(newUsername.trim());

      if (response.data.success) {
        // Actualizar el contexto
        if (updateUser) {
          updateUser({ ...user, username: newUsername.trim() });
        }

        setShowEditModal(false);
        Alert.alert("✅ Éxito", "Nombre de usuario actualizado");
      }
    } catch (error) {
      console.error("Error actualizando username:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre de usuario");
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      setLoading(true);
      const result = await logout();

      if (result.success) {
        console.log("✅ Logout exitoso");
        setShowLogoutModal(false);
        // La navegación será manejada automáticamente por AppNavigator
      } else {
        Alert.alert("Error", "No se pudo cerrar sesión");
      }
    } catch (error) {
      console.error("Error en logout:", error);
      Alert.alert("Error", "Ocurrió un error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar imagen de la galería
  const pickImageFromGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitas dar permiso para acceder a la galería"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setShowImagePickerModal(false);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error seleccionando imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  // Tomar foto con la cámara
  const takePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitas dar permiso para usar la cámara"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setShowImagePickerModal(false);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error tomando foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  // Subir imagen al servidor
  const uploadImage = async (imageUri) => {
    try {
      setLoading(true);

      // Por ahora, usar la URI local (solo desarrollo)
      const imageUrl = imageUri;

      await authAPI.updateProfileImage(imageUrl);

      // Actualizar el contexto
      if (updateUser) {
        updateUser({ ...user, profile_image_url: imageUrl });
      }

      Alert.alert("✅ Éxito", "Foto de perfil actualizada");
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      Alert.alert("Error", "No se pudo actualizar la foto de perfil");
    } finally {
      setLoading(false);
    }
  };

  // Cargar sección específica
  const loadSection = async (section) => {
    if (activeSection === section) {
      setActiveSection(null);
      return;
    }

    setActiveSection(section);
    setLoadingSection(true);

    try {
      if (section === "myBooks") {
        const response = await booksAPI.getMyBooks();
        setMyBooks(response.data || []);
      } else if (section === "favorites") {
        const response = await authAPI.getFavorites();
        setFavorites(response.data.books || []);
      } else if (section === "history") {
        const response = await authAPI.getReadingHistory();
        setReadingHistory(response.data.books || []);
      }
    } catch (error) {
      console.error(`Error cargando ${section}:`, error);
      Alert.alert("Error", `No se pudo cargar la información`);
    } finally {
      setLoadingSection(false);
    }
  };

  // Renderizar tarjeta de libro
  const renderBookCard = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
    >
      <Image
        source={{
          uri: item.cover_image_url || "https://via.placeholder.com/150x200",
        }}
        style={styles.bookCover}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.writer_name}
        </Text>
        {item.genre && (
          <View style={styles.genreTag}>
            <Text style={styles.genreText}>{item.genre}</Text>
          </View>
        )}
        <View style={styles.bookStats}>
          <Text style={styles.bookStat}>👁️ {item.view_count || 0}</Text>
          <Text style={styles.bookStat}>💚 {item.like_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Función auxiliar para obtener el color del badge según el rol
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "#FF5722";
      case "writer":
        return "#2196F3";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* Sección de perfil */}
        <View style={styles.profileSection}>
          {/* Imagen de perfil con botón de cámara */}
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={() => setShowImagePickerModal(true)}
          >
            <Image
              source={{
                uri:
                  user?.profile_image_url || "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <View style={styles.cameraIconOverlay}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>

          {/* Información del usuario */}
          <View style={styles.profileInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{user?.username}</Text>
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={() => setShowEditModal(true)}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.email}>{user?.email}</Text>

            {/* Badge de rol */}
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleBadgeColor(user?.role) },
              ]}
            >
              <Text style={styles.roleText}>
                {user?.role === "admin"
                  ? "Administrador"
                  : user?.role === "writer"
                  ? "Escritor"
                  : "Usuario"}
              </Text>
            </View>

            {/* Badge de bibliotecario si aplica */}
            {user?.is_librarian && (
              <View style={[styles.roleBadge, { backgroundColor: "#4CAF50" }]}>
                <Text style={styles.roleText}>📚 Bibliotecario</Text>
              </View>
            )}

            {/* Estadísticas */}
            {profileStats && (
              <View style={styles.statsSection}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {profileStats.books_count || 0}
                  </Text>
                  <Text style={styles.statLabel}>Libros</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {profileStats.total_likes || 0}
                  </Text>
                  <Text style={styles.statLabel}>Likes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {profileStats.total_views || 0}
                  </Text>
                  <Text style={styles.statLabel}>Vistas</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Menú de opciones */}
        <View style={styles.menuSection}>
          {/* Mis Libros */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => loadSection("myBooks")}
          >
            <Text style={styles.menuItemText}>📚 Mis Libros</Text>
            <Text style={styles.menuItemArrow}>
              {activeSection === "myBooks" ? "▼" : "▶"}
            </Text>
          </TouchableOpacity>

          {activeSection === "myBooks" && (
            <View style={styles.sectionContent}>
              {loadingSection ? (
                <ActivityIndicator size="small" color="#B87D5F" />
              ) : myBooks.length > 0 ? (
                <FlatList
                  data={myBooks}
                  renderItem={renderBookCard}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.emptyText}>
                  No has publicado libros aún
                </Text>
              )}
            </View>
          )}

          {/* Favoritos */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => loadSection("favorites")}
          >
            <Text style={styles.menuItemText}>❤️ Favoritos</Text>
            <Text style={styles.menuItemArrow}>
              {activeSection === "favorites" ? "▼" : "▶"}
            </Text>
          </TouchableOpacity>

          {activeSection === "favorites" && (
            <View style={styles.sectionContent}>
              {loadingSection ? (
                <ActivityIndicator size="small" color="#B87D5F" />
              ) : favorites.length > 0 ? (
                <FlatList
                  data={favorites}
                  renderItem={renderBookCard}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.emptyText}>No tienes favoritos aún</Text>
              )}
            </View>
          )}

          {/* Historial de lectura */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => loadSection("history")}
          >
            <Text style={styles.menuItemText}>📖 Historial</Text>
            <Text style={styles.menuItemArrow}>
              {activeSection === "history" ? "▼" : "▶"}
            </Text>
          </TouchableOpacity>

          {activeSection === "history" && (
            <View style={styles.sectionContent}>
              {loadingSection ? (
                <ActivityIndicator size="small" color="#B87D5F" />
              ) : readingHistory.length > 0 ? (
                <FlatList
                  data={readingHistory}
                  renderItem={renderBookCard}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.emptyText}>
                  No has leído ningún libro aún
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmación de logout */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres cerrar sesión?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>
                    Cerrar Sesión
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de edición de username */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Nombre de Usuario</Text>
            <TextInput
              style={styles.modalInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Nuevo nombre de usuario"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowEditModal(false);
                  setNewUsername(user?.username || "");
                }}
                disabled={loading}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleUpdateUsername}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar imagen */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Foto de Perfil</Text>

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.imagePickerOptionText}>
                📁 Seleccionar de Galería
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={takePhoto}
            >
              <Text style={styles.imagePickerOptionText}>📷 Tomar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imagePickerOption, styles.imagePickerCancel]}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={styles.imagePickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  // Estilos para visitantes
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFF",
  },
  guestImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 30,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 30,
  },
  guestFeatures: {
    width: "100%",
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: "#2C3E50",
    flex: 1,
  },
  guestLoginButton: {
    backgroundColor: "#B87D5F",
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  guestLoginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  guestRegisterButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#B87D5F",
  },
  guestRegisterButtonText: {
    color: "#B87D5F",
    fontSize: 16,
    fontWeight: "600",
  },
  // Resto de estilos originales...
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
  },
  cameraIconOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#B87D5F",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  cameraIcon: {
    fontSize: 20,
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginRight: 10,
  },
  editIconButton: {
    padding: 5,
  },
  editIcon: {
    fontSize: 20,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 5,
  },
  roleText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#EEE",
  },
  menuSection: {
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  menuItemText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  menuItemArrow: {
    fontSize: 16,
    color: "#999",
  },
  sectionContent: {
    paddingVertical: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    paddingVertical: 20,
  },
  bookCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: "100%",
    height: 150,
    backgroundColor: "#F0F0F0",
  },
  bookInfo: {
    padding: 10,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  genreTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  genreText: {
    fontSize: 10,
    color: "#2E7D32",
    fontWeight: "500",
  },
  bookStats: {
    flexDirection: "row",
    gap: 10,
  },
  bookStat: {
    fontSize: 11,
    color: "#999",
  },
  logoutButton: {
    backgroundColor: "#FF5252",
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F5F5F5",
  },
  modalButtonConfirm: {
    backgroundColor: "#B87D5F",
  },
  modalButtonTextCancel: {
    color: "#666",
    fontWeight: "600",
  },
  modalButtonTextConfirm: {
    color: "#FFF",
    fontWeight: "600",
  },
  imagePickerOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  imagePickerOptionText: {
    fontSize: 16,
    color: "#2C3E50",
    textAlign: "center",
  },
  imagePickerCancel: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  imagePickerCancelText: {
    fontSize: 16,
    color: "#FF5252",
    textAlign: "center",
    fontWeight: "600",
  },
});
