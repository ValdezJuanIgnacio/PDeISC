import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { booksAPI, librarianAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";

// Lista de géneros disponibles
const GENRES = [
  "Todos",
  "Fantasía",
  "Ciencia Ficción",
  "Romance",
  "Misterio",
  "Thriller",
  "Terror",
  "Aventura",
  "Drama",
  "Histórica",
  "Contemporánea",
  "Distopía",
  "Paranormal",
  "Young Adult",
  "New Adult",
  "Erótica",
  "Comedia",
  "Acción",
  "Suspenso",
  "Policial",
  "Otro",
];

export default function LibraryScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtrado y búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [selectedAuthor, setSelectedAuthor] = useState("Todos");
  const [authors, setAuthors] = useState(["Todos"]);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para el modal de reporte
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedGenre, selectedAuthor]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getPublished();
      const publishedBooks = response.data || [];
      setBooks(publishedBooks);

      // Extraer autores únicos
      const uniqueAuthors = [
        "Todos",
        ...new Set(
          publishedBooks.map((book) => book.writer_name).filter(Boolean)
        ),
      ];
      setAuthors(uniqueAuthors);

      console.log("📚 Libros publicados cargados:", publishedBooks.length);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.writer_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por género
    if (selectedGenre && selectedGenre !== "Todos") {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    // Filtrar por autor
    if (selectedAuthor && selectedAuthor !== "Todos") {
      filtered = filtered.filter((book) => book.writer_name === selectedAuthor);
    }

    setFilteredBooks(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("Todos");
    setSelectedAuthor("Todos");
  };

  const handleReportBook = (book) => {
    if (!user) {
      Alert.alert(
        "Acción no permitida",
        "Debes iniciar sesión para reportar contenido"
      );
      return;
    }

    if (!user.is_librarian) {
      Alert.alert(
        "Acción no permitida",
        "Solo los bibliotecarios pueden reportar contenido"
      );
      return;
    }

    setSelectedBook(book);
    setReportReason("");
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Error", "Por favor describe la razón del reporte");
      return;
    }

    try {
      setSubmittingReport(true);
      await librarianAPI.createReport({
        bookId: selectedBook.id,
        report_type: "inappropriate_book",
        reason: reportReason.trim(),
      });

      Alert.alert(
        "Éxito",
        "El reporte ha sido enviado correctamente. Los administradores lo revisarán pronto."
      );
      setShowReportModal(false);
      setSelectedBook(null);
      setReportReason("");
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "No se pudo enviar el reporte. Inténtalo nuevamente."
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  const renderBookCard = ({ item }) => (
    <View style={styles.bookCardContainer}>
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
      >
        <Image
          source={{
            uri: item.cover_image_url || "https://via.placeholder.com/150x200",
          }}
          style={styles.bookCover}
          resizeMode="cover"
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

      {/* Botón de reportar solo para bibliotecarios */}
      {user && user.is_librarian && (
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => handleReportBook(item)}
        >
          <Text style={styles.reportButtonText}>⚠️ Reportar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGenreFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Género</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {GENRES.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.filterChip,
              selectedGenre === genre && styles.filterChipActive,
            ]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedGenre === genre && styles.filterChipTextActive,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAuthorFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Autor</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {authors.map((author) => (
          <TouchableOpacity
            key={author}
            style={[
              styles.filterChip,
              selectedAuthor === author && styles.filterChipActive,
            ]}
            onPress={() => setSelectedAuthor(author)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedAuthor === author && styles.filterChipTextActive,
              ]}
            >
              {author}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B87D5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Artemis</Text>
          <Text style={styles.headerSubtitle}>
            {filteredBooks.length}{" "}
            {filteredBooks.length === 1 ? "libro" : "libros"} disponibles
          </Text>
        </View>

        {/* Botón de Login para visitantes */}
        {!user && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o autor..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros expandibles */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {renderGenreFilter()}
          {renderAuthorFilter()}

          {(selectedGenre !== "Todos" ||
            selectedAuthor !== "Todos" ||
            searchQuery) && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Lista de libros */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBookCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.booksGrid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron libros</Text>
          </View>
        }
      />

      {/* Modal de reporte */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar Libro</Text>

            {selectedBook && (
              <View style={styles.selectedBookInfo}>
                <Text style={styles.selectedBookTitle}>
                  {selectedBook.title}
                </Text>
                <Text style={styles.selectedBookAuthor}>
                  Por {selectedBook.writer_name}
                </Text>
              </View>
            )}

            <Text style={styles.modalLabel}>
              Describe la razón del reporte:
            </Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Ej: Contenido inapropiado, violento, ofensivo..."
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowReportModal(false)}
                disabled={submittingReport}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  submittingReport && styles.modalSubmitButtonDisabled,
                ]}
                onPress={submitReport}
                disabled={submittingReport}
              >
                {submittingReport ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>
                    Enviar Reporte
                  </Text>
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
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: "#B87D5F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterToggleButton: {
    backgroundColor: "#B87D5F",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  filterToggleIcon: {
    fontSize: 20,
  },
  filtersContainer: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  filterSection: {
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  filterChipActive: {
    backgroundColor: "#B87D5F",
    borderColor: "#B87D5F",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
  },
  filterChipTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  clearFiltersButton: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B87D5F",
    marginTop: 5,
  },
  clearFiltersText: {
    color: "#B87D5F",
    fontWeight: "600",
  },
  booksGrid: {
    padding: 10,
  },
  bookCardContainer: {
    width: "30%",
    margin: "1.5%",
  },
  bookCard: {
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
    aspectRatio: 1 / 1.3,
    backgroundColor: "#F0F0F0",
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },
  bookStats: {
    flexDirection: "row",
    gap: 12,
  },
  bookStat: {
    fontSize: 12,
    color: "#999",
  },
  reportButton: {
    backgroundColor: "#FFF3E0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  reportButtonText: {
    color: "#F57C00",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
  },
  selectedBookInfo: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedBookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  selectedBookAuthor: {
    fontSize: 14,
    color: "#666",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  reportInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
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
    fontSize: 16,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: "#FF5722",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalSubmitButtonDisabled: {
    opacity: 0.6,
  },
  modalSubmitButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
