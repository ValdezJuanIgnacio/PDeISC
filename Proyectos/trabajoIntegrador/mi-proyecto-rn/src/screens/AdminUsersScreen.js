import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { adminAPI } from "../services/api";
import {
  UsersIcon,
  SearchIcon,
  CloseIcon,
  LibraryIcon,
  ChevronRightIcon,
} from "../components/CustomIcons";

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();

    // Agregar listener para actualizar cuando se vuelve a la pantalla
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("📱 AdminUsersScreen enfocada - recargando usuarios");
      loadUsers();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.data || []);
      console.log("✅ Usuarios cargados:", response.data.data?.length);
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "#FF5722";
      case "writer":
        return "#2196F3";
      case "reader":
        return "#4CAF50";
      default:
        return "#999";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "writer":
        return "Escritor";
      case "reader":
        return "Lector";
      default:
        return role;
    }
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() =>
        navigation.navigate("AdminUsersDetail", { userId: item.id })
      }
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>

        <View style={styles.badges}>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleBadgeColor(item.role) },
            ]}
          >
            <Text style={styles.badgeText}>{getRoleLabel(item.role)}</Text>
          </View>

          {item.is_librarian && (
            <View style={styles.librarianBadge}>
              <LibraryIcon size={14} color="#FFF" />
              <Text style={styles.badgeText}>Bibliotecario</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.total_books || 0}</Text>
          <Text style={styles.statLabel}>Libros</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.total_chapters || 0}</Text>
          <Text style={styles.statLabel}>Capítulos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.total_likes || 0}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
      </View>

      <View style={styles.userFooter}>
        <Text style={styles.dateText}>
          Miembro desde: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <ChevronRightIcon size={20} color="#FF5722" />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <UsersIcon size={32} color="#2C3E50" />
          <Text style={styles.headerTitle}>Usuarios</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {filteredUsers.length} usuarios
        </Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <CloseIcon size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FF5722"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <SearchIcon size={64} color="#CCC" />
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            {searchQuery && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => setSearchQuery("")}
              >
                <Text style={styles.clearFiltersText}>Limpiar búsqueda</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#FFF",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
  },
  clearButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  badges: {
    alignItems: "flex-end",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  librarianBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
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
  userFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  clearFiltersText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
