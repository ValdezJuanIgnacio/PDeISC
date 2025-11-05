import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
  Linking,
} from "react-native";
import { booksAPI, interactionsAPI, commentsAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
// Para web necesitamos descargar de forma diferente
import * as FileSystem from "expo-file-system"; // Si usas Expo
// import RNFS from 'react-native-fs'; // Si usas React Native CLI

export default function BookDetailScreen({ route, navigation }) {
  const { bookId } = route.params;
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [downloadingChapter, setDownloadingChapter] = useState(null);

  // Estados de interacción
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  // Estados de comentarios
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    loadBookDetails();
    if (user) {
      loadUserInteractions();
      registerBookView();
    }
  }, [bookId]);

  const registerBookView = async () => {
    try {
      console.log("👁️ Registrando visualización del libro:", bookId);
      const response = await booksAPI.registerView(bookId);
      if (response.data?.view_count) {
        setViewCount(response.data.view_count);
      }
    } catch (error) {
      console.error("❌ Error al registrar visualización:", error);
    }
  };

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getById(bookId);
      const bookData = response.data;

      setBook(bookData);
      setChapters(bookData.chapters || []);
      setLikeCount(bookData.like_count || 0);
      setDislikeCount(bookData.dislike_count || 0);
      setViewCount(bookData.view_count || 0);
    } catch (error) {
      console.error("❌ Error loading book:", error);
      Alert.alert("Error", "No se pudo cargar la información del libro");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadUserInteractions = async () => {
    try {
      const response = await interactionsAPI.getUserInteractions(bookId);
      const interactions = response.data.data || response.data;

      setIsLiked(interactions.liked || false);
      setIsDisliked(interactions.disliked || false);
      setIsRead(interactions.read || false);
    } catch (error) {
      console.error("❌ Error loading interactions:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Debes iniciar sesión para dar like a los libros"
      );
      return;
    }

    try {
      if (isLiked) {
        await interactionsAPI.removeLike(bookId);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await interactionsAPI.addLike(bookId);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        if (isDisliked) {
          setIsDisliked(false);
          setDislikeCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
      Alert.alert("Error", "No se pudo procesar tu reacción");
    }
  };

  const handleDislike = async () => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Debes iniciar sesión para dar dislike a los libros"
      );
      return;
    }

    try {
      if (isDisliked) {
        await interactionsAPI.removeDislike(bookId);
        setIsDisliked(false);
        setDislikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await interactionsAPI.addDislike(bookId);
        setIsDisliked(true);
        setDislikeCount((prev) => prev + 1);

        if (isLiked) {
          setIsLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error handling dislike:", error);
      Alert.alert("Error", "No se pudo procesar tu reacción");
    }
  };

  const handleMarkAsRead = async () => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Debes iniciar sesión para marcar libros como leídos"
      );
      return;
    }

    try {
      if (isRead) {
        await interactionsAPI.unmarkAsRead(bookId);
        setIsRead(false);
        Alert.alert("✓", "Libro desmarcado como leído");
      } else {
        await interactionsAPI.markAsRead(bookId);
        setIsRead(true);
        Alert.alert("¡Genial! 📚", "Libro marcado como leído");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      Alert.alert("Error", "No se pudo marcar el libro");
    }
  };

  // ✅ NUEVA FUNCIÓN - Descargar capítulo individual
  const handleDownloadChapter = async (chapter) => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Debes iniciar sesión para descargar capítulos"
      );
      return;
    }

    try {
      setDownloadingChapter(chapter.id);
      console.log("📥 Descargando capítulo:", chapter.id);

      const response = await booksAPI.downloadChapterPDF(bookId, chapter.id);

      if (Platform.OS === "web") {
        // Para web, crear un enlace de descarga
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${book.title}_Capitulo_${chapter.chapter_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Alert.alert(
          "✅ Descarga completa",
          "El capítulo se ha descargado exitosamente"
        );
      } else {
        // Para móvil (Expo)
        const filename = `${book.title.replace(/[^a-z0-9]/gi, "_")}_Capitulo_${
          chapter.chapter_number
        }.pdf`;
        const fileUri = FileSystem.documentDirectory + filename;

        // Convertir blob a base64
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = async () => {
          const base64data = reader.result.split(",")[1];

          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert(
            "✅ Descarga completa",
            "El capítulo se ha descargado exitosamente",
            [
              {
                text: "Abrir",
                onPress: () => {
                  if (Platform.OS === "ios") {
                    Linking.openURL(fileUri);
                  } else {
                    FileSystem.getContentUriAsync(fileUri).then(
                      (contentUri) => {
                        Linking.openURL(contentUri);
                      }
                    );
                  }
                },
              },
              { text: "OK" },
            ]
          );
        };
      }
    } catch (error) {
      console.error("❌ Error descargando capítulo:", error);
      Alert.alert(
        "Error",
        "No se pudo descargar el capítulo. Por favor intenta nuevamente."
      );
    } finally {
      setDownloadingChapter(null);
    }
  };

  const handleDownloadBook = async () => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Debes iniciar sesión para descargar libros"
      );
      return;
    }

    if (chapters.length === 0) {
      Alert.alert(
        "Sin capítulos",
        "Este libro no tiene capítulos para descargar"
      );
      return;
    }

    try {
      setLoading(true);
      console.log(`📚 Descargando ${chapters.length} capítulos...`);

      // Descargar todos los capítulos secuencialmente
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        console.log(
          `📥 Descargando capítulo ${i + 1} de ${chapters.length}: ${
            chapter.title
          }`
        );

        await handleDownloadChapter(chapter);

        // Pequeña pausa entre descargas para no saturar
        if (i < chapters.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      Alert.alert(
        "✅ Descarga Completa",
        `Se descargaron todos los ${chapters.length} capítulos exitosamente`
      );
      console.log("✅ Descarga de todos los capítulos completada");
    } catch (error) {
      console.error("❌ Error descargando el libro completo:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al descargar algunos capítulos. Revisa tu conexión e intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response = await commentsAPI.getBookComments(bookId);
      const commentsList = response.data || [];
      setComments(commentsList);
    } catch (error) {
      console.error("Error loading comments:", error);
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Debes iniciar sesión para comentar en los libros"
      );
      return;
    }

    if (!newComment.trim()) {
      Alert.alert("Error", "El comentario no puede estar vacío");
      return;
    }

    try {
      await commentsAPI.create({
        content: newComment,
        book_id: bookId,
      });

      setNewComment("");
      Alert.alert("Éxito", "Comentario publicado");
      await loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "No se pudo publicar el comentario");
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const openChapter = (chapter) => {
    setSelectedChapter(chapter);
    setShowChapterModal(true);
  };

  const closeChapter = () => {
    setSelectedChapter(null);
    setShowChapterModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B87D5F" />
        <Text style={styles.loadingText}>Cargando libro...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Libro no encontrado</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
      >
        {/* Contenedor de imagen con botón superpuesto */}
        <View>
          <Image
            source={{
              uri:
                book.cover_image_url || "https://via.placeholder.com/300x400",
            }}
            style={styles.coverImage}
          />

          {/* Botón de volver SOBRE la imagen */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Volver</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenedor principal con información */}
        <View style={styles.bookInfo}>
          {/* Título y autor */}
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>Por {book.writer_name}</Text>

          {/* Género */}
          {book.genre && (
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>{book.genre}</Text>
            </View>
          )}

          {/* BOTONES DE INTERACCIÓN PRINCIPALES */}
          <View style={styles.mainActionsContainer}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.iconButton, isLiked && styles.iconButtonLiked]}
                onPress={handleLike}
              >
                <Text style={styles.iconButtonEmoji}>
                  {isLiked ? "💚" : "👍"}
                </Text>
                <Text style={styles.iconButtonCount}>{likeCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.iconButton,
                  isDisliked && styles.iconButtonDisliked,
                ]}
                onPress={handleDislike}
              >
                <Text style={styles.iconButtonEmoji}>
                  {isDisliked ? "💔" : "👎"}
                </Text>
                <Text style={styles.iconButtonCount}>{dislikeCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconButton, isRead && styles.iconButtonRead]}
                onPress={handleMarkAsRead}
              >
                <Text style={styles.iconButtonEmoji}>
                  {isRead ? "✅" : "📖"}
                </Text>
                <Text style={styles.iconButtonLabel}>
                  {isRead ? "Leído" : "Marcar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleDownloadBook}
              >
                <Text style={styles.iconButtonEmoji}>📥</Text>
                <Text style={styles.iconButtonLabel}>Descargar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👁️</Text>
                <Text style={styles.statText}>{viewCount} vistas</Text>
              </View>
            </View>
          </View>

          {/* Sinopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text style={styles.synopsis}>{book.synopsis}</Text>
          </View>

          {/* BOTÓN DE COMENTARIOS */}
          <TouchableOpacity
            style={styles.commentsToggleButton}
            onPress={toggleComments}
          >
            <View style={styles.commentsToggleContent}>
              <Text style={styles.commentsToggleIcon}>💬</Text>
              <Text style={styles.commentsToggleText}>
                {showComments ? "Ocultar comentarios" : "Ver comentarios"}
              </Text>
              <View style={styles.commentCountBadge}>
                <Text style={styles.commentCountText}>
                  {comments.length || book.comment_count || 0}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* SECCIÓN DE COMENTARIOS */}
          {showComments && (
            <View style={styles.commentsSection}>
              {user ? (
                <View style={styles.addCommentContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Escribe tu comentario..."
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleAddComment}
                  >
                    <Text style={styles.sendButtonText}>Publicar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.loginPrompt}>
                  <Text style={styles.loginPromptText}>
                    Inicia sesión para comentar
                  </Text>
                </View>
              )}

              {loadingComments ? (
                <ActivityIndicator
                  size="small"
                  color="#B87D5F"
                  style={{ marginVertical: 20 }}
                />
              ) : comments.length === 0 ? (
                <Text style={styles.noCommentsText}>
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>
                        {comment.username || comment.author_name}
                      </Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* LISTA DE CAPÍTULOS CON BOTÓN DE DESCARGA */}
          {chapters.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Capítulos ({chapters.length})
              </Text>

              {chapters.map((chapter, index) => (
                <View key={chapter.id} style={styles.chapterCard}>
                  <TouchableOpacity
                    style={styles.chapterMainContent}
                    onPress={() => openChapter(chapter)}
                  >
                    <View style={styles.chapterHeader}>
                      <Text style={styles.chapterNumber}>
                        Capítulo {chapter.chapter_number || index + 1}
                      </Text>
                      <Text style={styles.chapterArrow}>→</Text>
                    </View>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterPreview} numberOfLines={2}>
                      {chapter.content?.substring(0, 100)}...
                    </Text>
                  </TouchableOpacity>

                  {/* Botón de descarga individual */}
                  <TouchableOpacity
                    style={styles.downloadChapterButton}
                    onPress={() => handleDownloadChapter(chapter)}
                    disabled={downloadingChapter === chapter.id}
                  >
                    {downloadingChapter === chapter.id ? (
                      <ActivityIndicator size="small" color="#B87D5F" />
                    ) : (
                      <>
                        <Text style={styles.downloadIcon}>📥</Text>
                        <Text style={styles.downloadText}>Descargar PDF</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Espacio al final */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Modal para leer capítulo */}
      <Modal
        visible={showChapterModal}
        animationType="slide"
        onRequestClose={closeChapter}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeChapter}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedChapter?.title}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (selectedChapter) {
                  handleDownloadChapter(selectedChapter);
                }
              }}
            >
              <Text style={styles.modalDownloadButton}>📥</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.chapterContentContainer}
          >
            <Text style={styles.chapterContentTitle}>
              Capítulo {selectedChapter?.chapter_number}
            </Text>
            <Text style={styles.chapterContentSubtitle}>
              {selectedChapter?.title}
            </Text>
            <Text style={styles.chapterContentText}>
              {selectedChapter?.content}
            </Text>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  headerOverlay: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  backButton: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  coverImage: {
    width: "100%",
    height: 450,
    resizeMode: "cover",
  },
  bookInfo: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    padding: 20,
    minHeight: 500,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    fontFamily: "serif",
  },
  author: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  genreTag: {
    backgroundColor: "#F5E6D3",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  genreText: {
    fontSize: 14,
    color: "#B87D5F",
    fontWeight: "600",
  },
  mainActionsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconButtonLiked: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  iconButtonDisliked: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
  },
  iconButtonRead: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  iconButtonEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  iconButtonCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  iconButtonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  statText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  synopsis: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  commentsToggleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#B87D5F",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  commentsToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  commentsToggleIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  commentsToggleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B87D5F",
    flex: 1,
  },
  commentCountBadge: {
    backgroundColor: "#B87D5F",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: "center",
  },
  commentCountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  commentsSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  addCommentContainer: {
    marginBottom: 15,
  },
  commentInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sendButton: {
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginPrompt: {
    backgroundColor: "#FFF3E0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  loginPromptText: {
    color: "#E65100",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  noCommentsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    padding: 20,
    fontStyle: "italic",
  },
  commentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#B87D5F",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  chapterCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#B87D5F",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  chapterMainContent: {
    padding: 15,
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chapterNumber: {
    fontSize: 12,
    color: "#B87D5F",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  chapterArrow: {
    fontSize: 20,
    color: "#B87D5F",
    fontWeight: "bold",
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  chapterPreview: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  downloadChapterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B87D5F",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#A66D4F",
  },
  downloadIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  downloadText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  modalCloseButton: {
    fontSize: 28,
    color: "#666",
    fontWeight: "300",
  },
  modalDownloadButton: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  chapterContentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  chapterContentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B87D5F",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  chapterContentSubtitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    fontFamily: "serif",
  },
  chapterContentText: {
    fontSize: 18,
    color: "#333",
    lineHeight: 32,
    fontFamily: "serif",
  },
});
