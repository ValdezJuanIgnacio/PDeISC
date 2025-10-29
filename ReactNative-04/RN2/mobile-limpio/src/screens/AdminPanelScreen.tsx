import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import axios from "axios";

const API_URL = "http://192.168.100.86:3000/api";

type AdminPanelNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AdminPanel"
>;

type AdminPanelRouteProp = RouteProp<RootStackParamList, "AdminPanel">;

interface Props {
  navigation: AdminPanelNavigationProp;
  route: AdminPanelRouteProp;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  auth_provider: string;
  created_at: string;
  last_login: string;
}

export default function AdminPanelScreen({ navigation, route }: Props) {
  const { adminId, adminName } = route.params;

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  useEffect(() => {
    console.log("showDeleteModal cambió a:", showDeleteModal);
  }, [showDeleteModal]);

  useEffect(() => {
    console.log("showRoleModal cambió a:", showRoleModal);
  }, [showRoleModal]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log("🔄 Cargando usuarios...");
      const response = await axios.get(`${API_URL}/admin/users`, {
        params: { adminId },
      });

      console.log("✅ Usuarios cargados:", response.data);

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        Alert.alert("Error", "No se pudieron cargar los usuarios");
      }
    } catch (error: any) {
      console.error("❌ Error cargando usuarios:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudieron cargar los usuarios"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        params: { adminId },
      });

      if (response.data.success) {
        setStats({
          totalUsers: response.data.stats.totalUsers,
          todayUsers: response.data.stats.todayUsers,
        });
      }
    } catch (error) {
      console.error("❌ Error cargando estadísticas:", error);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
    loadStats();
  };

  const handleChangeRole = (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    console.log("🔄 Intentando cambiar rol:", {
      userId: user.id,
      userName: user.name,
      currentRole: user.role,
      newRole: newRole,
    });

    console.log("Setting selectedUser:", user);
    console.log("Setting selectedNewRole:", newRole);
    console.log("Setting showRoleModal to TRUE");

    setSelectedUser(user);
    setSelectedNewRole(newRole);
    setShowRoleModal(true);

    console.log("Estados actualizados");
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    setShowRoleModal(false);

    try {
      console.log("📤 Enviando petición de cambio de rol...");

      const response = await axios.put(
        `${API_URL}/admin/users/${selectedUser.id}/role`,
        {
          adminId,
          newRole: selectedNewRole,
        }
      );

      console.log("✅ Respuesta del servidor:", response.data);

      if (response.data.success) {
        Alert.alert("✅ Éxito", "Rol actualizado correctamente");
        loadUsers();
      } else {
        Alert.alert(
          "Error",
          response.data.message || "No se pudo cambiar el rol"
        );
      }
    } catch (error: any) {
      console.error("❌ Error cambiando rol:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "No se pudo cambiar el rol. Verifica la conexión."
      );
    }
  };

  const handleDeleteUser = (user: User) => {
    console.log("🗑️ Intentando eliminar usuario:", {
      userId: user.id,
      userName: user.name,
    });

    console.log("Setting selectedUser:", user);
    console.log("Setting showDeleteModal to TRUE");

    setSelectedUser(user);
    setShowDeleteModal(true);

    console.log("Estados actualizados para eliminación");
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setShowDeleteModal(false);

    try {
      console.log("📤 Enviando petición de eliminación...");

      const response = await axios.delete(
        `${API_URL}/admin/users/${selectedUser.id}`,
        {
          data: { adminId },
        }
      );

      console.log("✅ Respuesta del servidor:", response.data);

      if (response.data.success) {
        Alert.alert(
          "✅ Usuario Eliminado",
          `${selectedUser.name} ha sido eliminado correctamente`
        );
        loadUsers();
      } else {
        Alert.alert(
          "Error",
          response.data.message || "No se pudo eliminar el usuario"
        );
      }
    } catch (error: any) {
      console.error("❌ Error eliminando usuario:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "No se pudo eliminar el usuario. Verifica la conexión."
      );
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Deseas salir del panel de administración?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  const renderUserItem = ({ item }: { item: User }) => {
    // Verificar si se pueden mostrar los botones
    const canModify = item.role !== "admin" && item.id !== adminId;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.email ? (
              <Text style={styles.userEmail}>{item.email}</Text>
            ) : null}
            {item.phone ? (
              <Text style={styles.userPhone}>{item.phone}</Text>
            ) : null}
          </View>
          <View
            style={[
              styles.roleBadge,
              item.role === "admin" ? styles.adminBadge : styles.userBadge,
            ]}
          >
            <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.userMeta}>
          <Text style={styles.metaText}>
            Proveedor: {item.auth_provider || "local"}
          </Text>
          <Text style={styles.metaText}>
            Registro: {new Date(item.created_at).toLocaleDateString("es-ES")}
          </Text>
          {item.last_login ? (
            <Text style={styles.metaText}>
              Ultimo acceso:{" "}
              {new Date(item.last_login).toLocaleDateString("es-ES")}
            </Text>
          ) : null}
        </View>

        {canModify ? (
          <View style={styles.userActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.roleButton]}
              onPress={() => {
                console.log("Boton cambiar rol presionado");
                handleChangeRole(item);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                Cambiar a {item.role === "user" ? "Admin" : "User"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                console.log("Boton eliminar presionado");
                handleDeleteUser(item);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.protectedInfo}>
            <Text style={styles.protectedInfoText}>
              {item.id === adminId
                ? "Tu cuenta (no modificable)"
                : "Administrador (protegido)"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <Text style={styles.headerSubtitle}>Bienvenido, {adminName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Usuarios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.todayUsers}</Text>
          <Text style={styles.statLabel}>Hoy</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredUsers.length}</Text>
          <Text style={styles.statLabel}>Filtrados</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            </View>
          }
        />
      )}

      {/* Modal de Confirmación para Cambiar Rol */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>🔄</Text>
              <Text style={styles.modalTitle}>Cambiar Rol</Text>
            </View>

            <Text style={styles.modalMessage}>
              ¿Cambiar rol de{" "}
              <Text style={styles.boldText}>{selectedUser?.name}</Text> de{" "}
              <Text style={styles.boldText}>{selectedUser?.role}</Text> a{" "}
              <Text style={styles.boldText}>{selectedNewRole}</Text>?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRoleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmRoleChange}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación para Eliminar Usuario */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>⚠️</Text>
              <Text style={styles.modalTitle}>Eliminar Usuario</Text>
            </View>

            <Text style={styles.modalMessage}>
              ¿Estás seguro de eliminar a{" "}
              <Text style={styles.boldText}>{selectedUser?.name}</Text>?
            </Text>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>Esta acción es PERMANENTE</Text>
              <Text style={styles.warningSubtext}>Se eliminarán:</Text>
              <Text style={styles.warningItem}>• Información personal</Text>
              <Text style={styles.warningItem}>• Documentos</Text>
              <Text style={styles.warningItem}>• Historial completo</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteUser}
              >
                <Text style={styles.deleteButtonText}>ELIMINAR</Text>
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    marginTop: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 20,
    color: "#999",
  },
  listContainer: {
    padding: 15,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  adminBadge: {
    backgroundColor: "#dc3545",
  },
  userBadge: {
    backgroundColor: "#28a745",
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  userMeta: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  userActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  roleButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  protectedInfo: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },
  protectedInfoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  // Estilos para los modales
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  warningBox: {
    backgroundColor: "#fff3cd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  warningText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 5,
  },
  warningSubtext: {
    fontSize: 13,
    color: "#856404",
    marginBottom: 5,
    marginTop: 5,
  },
  warningItem: {
    fontSize: 12,
    color: "#856404",
    marginLeft: 5,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
