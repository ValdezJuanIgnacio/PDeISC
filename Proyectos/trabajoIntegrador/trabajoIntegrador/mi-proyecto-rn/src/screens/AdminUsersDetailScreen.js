import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
} from "react-native";
import { adminAPI } from "../services/api";

export default function AdminUserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBookDeleteModal, setShowBookDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showLibrarianModal, setShowLibrarianModal] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserProfile(userId);
      const data = response.data.data;

      setUser(data.user);
      setBooks(data.books || []);
      setStats(data.stats);
    } catch (error) {
      console.error("Error loading user profile:", error);
      Alert.alert("Error", "No se pudo cargar el perfil del usuario");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLibrarian = () => {
    console.log("🔄 handleToggleLibrarian called");
    console.log("👤 User:", user);
    console.log("🆔 UserId:", userId);
    console.log("📚 is_librarian:", user.is_librarian);

    // Mostrar modal de confirmación
    setShowLibrarianModal(true);
  };

  const confirmToggleLibrarian = async () => {
    console.log("✅ User confirmed toggle librarian");

    try {
      setActionLoading(true);
      console.log("⏳ Action loading set to true");

      console.log(`📤 Calling API... is_librarian=${user.is_librarian}`);

      let response;
      if (user.is_librarian) {
        console.log("📤 Calling demoteFromLibrarian");
        response = await adminAPI.demoteFromLibrarian(userId);
      } else {
        console.log("📤 Calling promoteToLibrarian");
        response = await adminAPI.promoteToLibrarian(userId);
      }

      console.log("✅ API Response:", response);

      setShowLibrarianModal(false);

      // Mostrar éxito después de cerrar el modal
      setTimeout(() => {
        Alert.alert(
          "✅ Éxito",
          `Usuario ${user.is_librarian ? "ya no es" : "ahora es"} bibliotecario`
        );
      }, 300);

      // Recargar perfil
      console.log("🔄 Reloading user profile");
      await loadUserProfile();
      console.log("✅ Profile reloaded");
    } catch (error) {
      console.error("❌ Error toggling librarian:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setShowLibrarianModal(false);

      setTimeout(() => {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            error.message ||
            "No se pudo cambiar el rol del usuario"
        );
      }, 300);
    } finally {
      setActionLoading(false);
      console.log("⏳ Action loading set to false");
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      await adminAPI.deleteUser(userId);

      setShowDeleteModal(false);

      // Navegar inmediatamente de vuelta y mostrar confirmación
      navigation.goBack();

      // Pequeño delay para que la navegación se complete antes del Alert
      setTimeout(() => {
        Alert.alert("✅ Éxito", "Usuario eliminado correctamente");
      }, 500);
    } catch (error) {
      console.error("Error deleting user:", error);
      Alert.alert("Error", "No se pudo eliminar el usuario");
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      setActionLoading(true);
      await adminAPI.deleteBook(bookId);

      Alert.alert("✅ Éxito", "Libro eliminado correctamente");

      // Actualizar lista de libros
      setBooks(books.filter((book) => book.id !== bookId));
      setShowBookDeleteModal(false);
      setSelectedBook(null);

      // Recargar perfil para actualizar estadísticas
      loadUserProfile();
    } catch (error) {
      console.error("Error deleting book:", error);
      Alert.alert("Error", "No se pudo eliminar el libro");
    } finally {
      setActionLoading(false);
    }
  };

  const renderBookCard = (book) => (
    <View key={book.id} style={styles.bookCard}>
      <Image
        source={{
          uri: book.cover_image_url || "https://via.placeholder.com/100x150",
        }}
        style={styles.bookCover}
      />

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookGenre}>{book.genre || "Sin género"}</Text>

        <View style={styles.bookStats}>
          <Text style={styles.bookStat}>📖 {book.chapter_count || 0} caps</Text>
          <Text style={styles.bookStat}>💚 {book.like_count || 0}</Text>
          <Text style={styles.bookStat}>👁️ {book.view_count || 0}</Text>
        </View>

        <View style={styles.bookActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() =>
              navigation.navigate("BookDetail", {
                bookId: book.id,
                isAdmin: true,
              })
            }
          >
            <Text style={styles.viewButtonText}>Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBookButton}
            onPress={() => {
              setSelectedBook(book);
              setShowBookDeleteModal(true);
            }}
          >
            <Text style={styles.deleteBookButtonText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Usuario no encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIconText}>← Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Perfil del usuario */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: user.profile_image_url || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />

          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.roleContainer}>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    user.role === "admin" ? "#FF5722" : "#2196F3",
                },
              ]}
            >
              <Text style={styles.roleText}>
                {user.role === "admin" ? "Admin" : "Escritor"}
              </Text>
            </View>

            {user.is_librarian && (
              <View style={styles.librarianBadge}>
                <Text style={styles.roleText}>📚 Bibliotecario</Text>
              </View>
            )}
          </View>

          {/* Estadísticas */}
          {stats && (
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total_books || 0}</Text>
                <Text style={styles.statLabel}>Libros</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.total_chapters || 0}
                </Text>
                <Text style={styles.statLabel}>Capítulos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total_likes || 0}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total_views || 0}</Text>
                <Text style={styles.statLabel}>Vistas</Text>
              </View>
            </View>
          )}
        </View>

        {/* Acciones Admin */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones de Administrador</Text>

          {/* Botón Convertir/Quitar Bibliotecario */}
          {user.role !== "admin" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                user.is_librarian ? styles.demoteButton : styles.promoteButton,
              ]}
              onPress={handleToggleLibrarian}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.actionButtonIcon}>
                    {user.is_librarian ? "❌" : "📚"}
                  </Text>
                  <Text style={styles.actionButtonText}>
                    {user.is_librarian
                      ? "Quitar Rol de Bibliotecario"
                      : "Convertir en Bibliotecario"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Botón Eliminar Usuario */}
          {user.role !== "admin" && (
            <TouchableOpacity
              style={styles.deleteUserButton}
              onPress={() => setShowDeleteModal(true)}
              disabled={actionLoading}
            >
              <Text style={styles.deleteUserButtonIcon}>🗑️</Text>
              <Text style={styles.deleteUserButtonText}>Eliminar Cuenta</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Libros del usuario */}
        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>
            Libros Publicados ({books.length})
          </Text>

          {books.length === 0 ? (
            <View style={styles.emptyBooks}>
              <Text style={styles.emptyBooksText}>
                Este usuario no ha publicado libros aún
              </Text>
            </View>
          ) : (
            books.map((book) => renderBookCard(book))
          )}
        </View>
      </ScrollView>

      {/* Modal de confirmación de cambio de rol bibliotecario */}
      <Modal
        visible={showLibrarianModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLibrarianModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {user?.is_librarian
                ? "⚠️ Quitar Rol de Bibliotecario"
                : "📚 Convertir en Bibliotecario"}
            </Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres{" "}
              {user?.is_librarian
                ? "quitar el rol de bibliotecario"
                : "convertir en bibliotecario"}{" "}
              a <Text style={styles.boldText}>{user?.username}</Text>?
            </Text>
            {user?.is_librarian ? (
              <Text style={[styles.modalText, styles.warningText]}>
                El usuario perderá los permisos para revisar libros y crear
                reportes.
              </Text>
            ) : (
              <Text
                style={[
                  styles.modalText,
                  { color: "#4CAF50", fontWeight: "600" },
                ]}
              >
                El usuario obtendrá permisos para revisar libros y crear
                reportes.
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLibrarianModal(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  user?.is_librarian
                    ? styles.modalButtonConfirm
                    : styles.modalButtonSuccess,
                ]}
                onPress={confirmToggleLibrarian}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>
                    {user?.is_librarian ? "Quitar Rol" : "Otorgar Rol"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación de usuario */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Eliminar Usuario</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres eliminar a{" "}
              <Text style={styles.boldText}>{user.username}</Text>?
            </Text>
            <Text style={[styles.modalText, styles.warningText]}>
              Esta acción eliminará:
            </Text>
            <Text style={styles.modalText}>
              • Todos sus libros ({stats?.total_books || 0}){"\n"}• Todos sus
              capítulos ({stats?.total_chapters || 0}){"\n"}• Todos sus
              comentarios
              {"\n"}• Su cuenta permanentemente
            </Text>
            <Text style={[styles.modalText, styles.warningText]}>
              Esta acción NO se puede deshacer.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación de libro */}
      <Modal
        visible={showBookDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBookDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Eliminar Libro</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres eliminar el libro{" "}
              <Text style={styles.boldText}>"{selectedBook?.title}"</Text>?
            </Text>
            <Text style={[styles.modalText, styles.warningText]}>
              Esto eliminará todos sus capítulos y comentarios.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowBookDeleteModal(false);
                  setSelectedBook(null);
                }}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => handleDeleteBook(selectedBook.id)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#FFF",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIconText: {
    fontSize: 16,
    color: "#FF5722",
    fontWeight: "600",
  },
  profileSection: {
    backgroundColor: "#FFF",
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  librarianBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
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
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#EEE",
  },
  actionsSection: {
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  promoteButton: {
    backgroundColor: "#4CAF50",
  },
  demoteButton: {
    backgroundColor: "#FF9800",
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteUserButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 15,
    borderRadius: 10,
  },
  deleteUserButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  deleteUserButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  booksSection: {
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 15,
  },
  emptyBooks: {
    padding: 40,
    alignItems: "center",
  },
  emptyBooksText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  bookInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  bookGenre: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  bookStats: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 10,
  },
  bookStat: {
    fontSize: 12,
    color: "#999",
  },
  bookActions: {
    flexDirection: "row",
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteBookButton: {
    flex: 1,
    backgroundColor: "#F44336",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteBookButtonText: {
    color: "#FFF",
    fontSize: 14,
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
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "bold",
    color: "#2C3E50",
  },
  warningText: {
    color: "#F44336",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F5F5F5",
  },
  modalButtonConfirm: {
    backgroundColor: "#F44336",
  },
  modalButtonSuccess: {
    backgroundColor: "#4CAF50",
  },
  modalButtonTextCancel: {
    color: "#666",
    fontWeight: "600",
  },
  modalButtonTextConfirm: {
    color: "#FFF",
    fontWeight: "600",
  },
});
