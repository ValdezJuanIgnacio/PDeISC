import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { librarianAPI } from "../services/api";
import {
  BookIcon,
  FileTextIcon,
  ClipboardIcon,
  ShieldIcon,
} from "../components/CustomIcons";

export default function LibrarianReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("pending"); // 'all', 'pending', 'reviewed', 'dismissed'

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await librarianAPI.getMyReports(filter);
      setReports(response.data.data || []);
      console.log("📋 Reportes cargados:", response.data.data?.length);
    } catch (error) {
      console.error("Error loading reports:", error);
      Alert.alert("Error", "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handleCancelReport = (reportId) => {
    console.log("🔴 Intentando cancelar reporte:", reportId);

    if (!reportId) {
      console.error("❌ No reportId provided");
      Alert.alert("Error", "ID de reporte no válido");
      return;
    }

    Alert.alert(
      "Cancelar Reporte",
      "¿Estás seguro de que quieres cancelar este reporte? Esta acción no se puede deshacer.",
      [
        {
          text: "No",
          style: "cancel",
          onPress: () => console.log("🟡 Cancelación abortada por el usuario"),
        },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => {
            console.log("🟢 Usuario confirmó eliminación, ejecutando...");
            deleteReportAsync(reportId);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteReportAsync = async (reportId) => {
    try {
      console.log("🔵 Llamando a librarianAPI.deleteReport con ID:", reportId);
      const response = await librarianAPI.deleteReport(reportId);
      console.log("✅ Respuesta del servidor:", response.data);
      Alert.alert("Éxito", "Reporte cancelado correctamente");
      await loadReports();
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Request config:", error.config);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "No se pudo cancelar el reporte"
      );
    }
  };

  const handleViewBook = (bookId) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "reviewed":
        return "#4CAF50";
      case "dismissed":
        return "#9E9E9E";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "reviewed":
        return "Revisado";
      case "dismissed":
        return "Desestimado";
      default:
        return status;
    }
  };

  const renderReportCard = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <View style={styles.reportTypeContainer}>
            {item.report_type === "inappropriate_book" ? (
              <>
                <BookIcon size={18} color="#2C3E50" />
                <Text style={styles.reportType}>Libro Inapropiado</Text>
              </>
            ) : (
              <>
                <FileTextIcon size={18} color="#2C3E50" />
                <Text style={styles.reportType}>Capítulo Inapropiado</Text>
              </>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.reportDate}>
          {new Date(item.created_at).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.reportBody}>
        <Text style={styles.bookTitle}>
          {item.book_title || "Libro desconocido"}
        </Text>
        {item.chapter_title && (
          <Text style={styles.chapterTitle}>
            Capítulo: {item.chapter_title}
          </Text>
        )}
        <Text style={styles.writerName}>
          Autor: {item.writer_name || "Desconocido"}
        </Text>

        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Razón del reporte:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>

        {item.status !== "pending" && item.reviewed_by_name && (
          <Text style={styles.reviewedBy}>
            Revisado por: {item.reviewed_by_name}
          </Text>
        )}

        {item.admin_notes && (
          <View style={styles.adminNotesContainer}>
            <Text style={styles.adminNotesLabel}>Notas del Admin:</Text>
            <Text style={styles.adminNotesText}>{item.admin_notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.reportActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewBook(item.book_id)}
        >
          <Text style={styles.viewButtonText}>Ver Libro</Text>
        </TouchableOpacity>

        {item.status === "pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelReport(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancelar Reporte</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (filterValue, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterValue && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === filterValue && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B87D5F" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Reportes</Text>
        <Text style={styles.headerSubtitle}>
          {reports.length} {reports.length === 1 ? "reporte" : "reportes"}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton("all", "Todos")}
        {renderFilterButton("pending", "Pendientes")}
        {renderFilterButton("reviewed", "Revisados")}
        {renderFilterButton("dismissed", "Desestimados")}
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B87D5F"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ClipboardIcon size={64} color="#CCC" />
            <Text style={styles.emptyText}>No hay reportes</Text>
            <Text style={styles.emptySubtext}>
              {filter === "pending"
                ? "No tienes reportes pendientes"
                : filter === "reviewed"
                ? "No tienes reportes revisados"
                : filter === "dismissed"
                ? "No tienes reportes desestimados"
                : "Aún no has creado ningún reporte"}
            </Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
    backgroundColor: "#FFF",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#B87D5F",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  listContainer: {
    padding: 15,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reportTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  reportDate: {
    fontSize: 12,
    color: "#999",
  },
  reportBody: {
    marginBottom: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  chapterTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  writerName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  reasonContainer: {
    backgroundColor: "#FFF8E1",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F57C00",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  reviewedBy: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 8,
    fontStyle: "italic",
  },
  adminNotesContainer: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
  },
  adminNotesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  reportActions: {
    flexDirection: "row",
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#B87D5F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF5252",
  },
  cancelButtonText: {
    color: "#FF5252",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
