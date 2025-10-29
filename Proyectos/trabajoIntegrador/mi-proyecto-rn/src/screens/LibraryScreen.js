import React, { useState, useEffect } from "react";
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
} from "react-native";
import { booksAPI } from "../services/api";

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
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("biblioteca");

  // Estados de filtrado y búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [selectedAuthor, setSelectedAuthor] = useState("Todos");
  const [authors, setAuthors] = useState(["Todos"]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedGenre, selectedAuthor]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // Obtener solo libros publicados (status = 'published')
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
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Filtrar por búsqueda (título o autor)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.writer_name?.toLowerCase().includes(query)
      );
    }

    // Filtrar por género
    if (selectedGenre !== "Todos") {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    // Filtrar por autor
    if (selectedAuthor !== "Todos") {
      filtered = filtered.filter((book) => book.writer_name === selectedAuthor);
    }

    setFilteredBooks(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("Todos");
    setSelectedAuthor("Todos");
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
    >
      <Image
        source={{
          uri: item.cover_image_url || "https://via.placeholder.com/150",
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
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Artemis</Text>
        <Text style={styles.headerSubtitle}>
          {filteredBooks.length}{" "}
          {filteredBooks.length === 1 ? "libro" : "libros"} disponibles
        </Text>
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

          {/* Botón para limpiar filtros */}
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
      {filteredBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No se encontraron libros</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ||
            selectedGenre !== "Todos" ||
            selectedAuthor !== "Todos"
              ? "Intenta ajustar los filtros"
              : "Aún no hay libros publicados"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderBook}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.bookList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "serif",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  filterToggleButton: {
    marginLeft: 10,
    backgroundColor: "#B87D5F",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  filterToggleIcon: {
    fontSize: 20,
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterSection: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: "#B87D5F",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  clearFiltersButton: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B87D5F",
    alignItems: "center",
  },
  clearFiltersText: {
    color: "#B87D5F",
    fontSize: 14,
    fontWeight: "600",
  },
  bookList: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  bookCard: {
    flex: 1,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    maxWidth: "45%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: "#F5E6D3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  genreText: {
    fontSize: 11,
    color: "#B87D5F",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
