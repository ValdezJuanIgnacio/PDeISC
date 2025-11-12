import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { adminAPI } from "../services/api";
import {
  BookIcon,
  CheckCircleIcon,
  AlertIcon,
  ShieldIcon,
  HomeIcon,
} from "../components/CustomIcons";

export default function AdminReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Estados para modales de confirmación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingReports();
      setReports(response.data.data || []);
      console.log("📋 Reportes cargados:", response.data.data?.length);
    } catch (error) {
      console.error("Error loading reports:", error);
      Platform.OS === "web"
        ? window.alert("Error: No se pudieron cargar los reportes")
        : Alert.alert("Error", "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handleViewBook = (bookId) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const handleReportAction = (report) => {
    setSelectedReport(report);
    setAdminNotes("");
    setShowActionModal(true);
  };

  const handleDismissReport = async () => {
    if (!selectedReport) {
      console.error("❌ No selectedReport");
      return;
    }

    console.log("🔍 Desestimando reporte:", selectedReport.id);

    try {
      setProcessingAction(true);
      console.log("🔵 Llamando a adminAPI.reviewReport con action: dismiss");
      const response = await adminAPI.reviewReport(selectedReport.id, {
        action: "dismiss",
        admin_notes: adminNotes.trim() || "Reporte desestimado",
      });
      console.log("✅ Respuesta del servidor:", response.data);

      Alert.alert("Éxito", "Reporte desestimado correctamente");
      setShowActionModal(false);
      setSelectedReport(null);
      setAdminNotes("");
      await loadReports();
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response data:", error.response?.data);
      Platform.OS === "web"
        ? window.alert(
            "Error: " +
              (error.response?.data?.message ||
                error.message ||
                "No se pudo desestimar el reporte")
          )
        : Alert.alert(
            "Error",
            error.response?.data?.message ||
              error.message ||
              "No se pudo desestimar el reporte"
          );
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteContent = () => {
    if (!selectedReport) {
      console.error("❌ No selectedReport");
      return;
    }

    console.log(
      "🗑️ Intentando eliminar contenido del reporte:",
      selectedReport.id
    );

    // Abrir modal de confirmación
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteContent = () => {
    console.log("🟢 Usuario confirmó eliminación de contenido");
    setShowDeleteConfirmModal(false);
    deleteContentAsync();
  };

  const cancelDeleteContent = () => {
    console.log("🟡 Eliminación de contenido cancelada");
    setShowDeleteConfirmModal(false);
  };

  const deleteContentAsync = async () => {
    if (!selectedReport) return;

    try {
      setProcessingAction(true);
      console.log("🔵 Iniciando deleteContentAsync");
      console.log("🔵 selectedReport:", selectedReport);
      console.log("🔵 selectedReport.id:", selectedReport.id);
      console.log("🔵 adminNotes:", adminNotes);
      console.log(
        "🔵 Llamando a adminAPI.reviewReport con action: delete_content"
      );
      const response = await adminAPI.reviewReport(selectedReport.id, {
        action: "delete_content",
        admin_notes: adminNotes.trim() || "Contenido eliminado por reporte",
      });
      console.log("✅ Respuesta del servidor:", response.data);

      Alert.alert("Éxito", "Contenido eliminado correctamente");
      setShowActionModal(false);
      setSelectedReport(null);
      setAdminNotes("");
      await loadReports();
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response data:", error.response?.data);
      Platform.OS === "web"
        ? window.alert(
            "Error: " +
              (error.response?.data?.message ||
                error.message ||
                "No se pudo eliminar el contenido")
          )
        : Alert.alert(
            "Error",
            error.response?.data?.message ||
              error.message ||
              "No se pudo eliminar el contenido"
          );
    } finally {
      setProcessingAction(false);
    }
  };

  const renderReportCard = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <View style={styles.reportTypeContainer}>
            {item.report_type === "inappropriate_book" ? (
              <BookIcon size={20} color="#F44336" />
            ) : (
              <ShieldIcon size={20} color="#F44336" />
            )}
            <Text style={styles.reportType}>
              {item.report_type === "inappropriate_book"
                ? "Libro Inapropiado"
                : "Capítulo Inapropiado"}
            </Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pendiente</Text>
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

        <View style={styles.reporterContainer}>
          <Text style={styles.reporterLabel}>Reportado por:</Text>
          <Text style={styles.reporterName}>
            {item.reporter_name} ({item.reporter_email})
          </Text>
        </View>

        <View style={styles.reasonContainer}>
          <View style={styles.reasonHeader}>
            <AlertIcon size={16} color="#F57C00" />
            <Text style={styles.reasonLabel}>Razón del reporte:</Text>
          </View>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
      </View>

      <View style={styles.reportActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewBook(item.book_id)}
        >
          <BookIcon size={16} color="#FFF" />
          <Text style={styles.viewButtonText}>Ver Libro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleReportAction(item)}
        >
          <Text style={styles.actionButtonText}>Acciones</Text>
        </TouchableOpacity>
      </View>
    </View>
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
      {/* Botón de volver al inicio */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate("Home")}
      >
        <HomeIcon size={24} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes Pendientes</Text>
        <Text style={styles.headerSubtitle}>
          {reports.length} {reports.length === 1 ? "reporte" : "reportes"}
        </Text>
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
            <CheckCircleIcon size={64} color="#4CAF50" />
            <Text style={styles.emptyText}>No hay reportes pendientes</Text>
            <Text style={styles.emptySubtext}>
              Todos los reportes han sido revisados
            </Text>
          </View>
        }
      />

      {/* Modal de Acciones */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Acciones del Reporte</Text>

            {selectedReport && (
              <View style={styles.selectedReportInfo}>
                <Text style={styles.selectedReportTitle}>
                  {selectedReport.book_title}
                </Text>
                {selectedReport.chapter_title && (
                  <Text style={styles.selectedReportTitle}>
                    Capítulo: {selectedReport.chapter_title}
                  </Text>
                )}
                <Text style={styles.selectedReportAuthor}>
                  por {selectedReport.writer_name}
                </Text>
                <View style={styles.selectedReportReasonContainer}>
                  <AlertIcon size={14} color="#F57C00" />
                  <Text style={styles.selectedReportReason}>
                    {selectedReport.reason}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.modalLabel}>
              Notas del administrador (opcional):
            </Text>
            <TextInput
              style={styles.notesInput}
              value={adminNotes}
              onChangeText={setAdminNotes}
              placeholder="Añade una nota sobre tu decisión..."
              placeholderTextColor="#999"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowActionModal(false);
                  setSelectedReport(null);
                  setAdminNotes("");
                }}
                disabled={processingAction}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalDismissButton,
                  processingAction && styles.buttonDisabled,
                ]}
                onPress={handleDismissReport}
                disabled={processingAction}
              >
                {processingAction ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalDismissButtonText}>Desestimar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalDeleteButton,
                  processingAction && styles.buttonDisabled,
                ]}
                onPress={handleDeleteContent}
                disabled={processingAction}
              >
                <Text style={styles.modalDeleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={cancelDeleteContent}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmModalHeader}>
              <ShieldIcon size={60} color="#F44336" />
            </View>

            <Text style={styles.confirmModalTitle}>
              ¿Eliminar este contenido?
            </Text>

            <Text style={styles.confirmModalMessage}>
              Esta acción es permanente y eliminará{" "}
              {selectedReport?.report_type === "inappropriate_book"
                ? "el libro completo con todos sus capítulos"
                : "el capítulo reportado"}
              . Los usuarios no podrán acceder más a este contenido.
            </Text>

            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  styles.confirmModalCancelButton,
                ]}
                onPress={cancelDeleteContent}
              >
                <Text style={styles.confirmModalCancelButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  styles.confirmModalDeleteButton,
                ]}
                onPress={confirmDeleteContent}
              >
                <Text style={styles.confirmModalDeleteButtonText}>
                  Eliminar
                </Text>
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
  homeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    backgroundColor: "#B87D5F",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
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
  header: {
    backgroundColor: "#FFF",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 100 : 70,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 15,
  },
  reportCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    marginBottom: 12,
  },
  reportInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTypeRow: {
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
  pendingBadge: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
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
  reporterContainer: {
    backgroundColor: "#E3F2FD",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  reporterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 4,
  },
  reporterName: {
    fontSize: 14,
    color: "#666",
  },
  reasonContainer: {
    backgroundColor: "#FFF8E1",
    padding: 10,
    borderRadius: 8,
  },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F57C00",
  },
  reasonText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  reportActions: {
    flexDirection: "row",
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#B87D5F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  viewButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFF",
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  selectedReportInfo: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedReportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  selectedReportAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  selectedReportReasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectedReportReason: {
    fontSize: 14,
    color: "#F57C00",
    fontStyle: "italic",
    flex: 1,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  modalCancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  modalDismissButton: {
    flex: 1,
    backgroundColor: "#9E9E9E",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalDismissButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: "#F44336",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalDeleteButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Estilos para modales de confirmación
  confirmModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 0,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
  },
  confirmModalHeader: {
    backgroundColor: "#FFEBEE",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  confirmModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  confirmModalButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  confirmModalButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmModalCancelButton: {
    borderRightWidth: 1,
    borderRightColor: "#EEE",
  },
  confirmModalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmModalConfirmButton: {
    backgroundColor: "transparent",
  },
  confirmModalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  confirmModalDeleteButton: {
    backgroundColor: "transparent",
  },
  confirmModalDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
});
