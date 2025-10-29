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
  Share,
  Linking,
} from "react-native";
import {
  booksAPI,
  chaptersAPI,
  interactionsAPI,
  commentsAPI,
} from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function BookDetailScreen({ route, navigation }) {
  const { bookId } = route.params;
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]); // ✅ NUEVO: Estado separado para capítulos
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false); // ✅ NUEVO
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Estados de interacción
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Estados de comentarios
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState("book"); // 'book' o 'chapter'
  const [selectedChapterForComment, setSelectedChapterForComment] =
    useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    loadBook();
    loadUserInteractions();
  }, []);

  const loadBook = async () => {
    try {
      console.log("📚 Cargando libro con ID:", bookId);
      const response = await booksAPI.getById(bookId);
      const bookData = response.data;

      console.log("✅ Libro cargado:", bookData.title);
      console.log("📖 Tipo de libro:", bookData.type);

      setBook(bookData);
      setLikeCount(bookData.like_count || 0);
      setDislikeCount(bookData.dislike_count || 0);

      // ✅ NUEVO: Cargar capítulos si es un libro in_app
      if (bookData.type === "in_app") {
        await loadChapters(bookId);
      }
    } catch (error) {
      console.error("❌ Error loading book:", error);
      Alert.alert("Error", "No se pudo cargar el libro");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Cargar capítulos
  const loadChapters = async (bookId) => {
    try {
      setLoadingChapters(true);
      console.log("📖 Cargando capítulos del libro:", bookId);

      const response = await chaptersAPI.getByBookId(bookId);
      const chaptersData = response.data || [];

      console.log("✅ Capítulos cargados:", chaptersData.length);
      setChapters(chaptersData);

      if (chaptersData.length === 0) {
        console.log("⚠️ Este libro no tiene capítulos");
      }
    } catch (error) {
      console.error("❌ Error loading chapters:", error);
      Alert.alert("Info", "No se pudieron cargar los capítulos");
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  };

  const loadUserInteractions = async () => {
    if (!user) return;

    try {
      const response = await interactionsAPI.getUserInteractions(bookId);
      const { liked, disliked, read } = response.data;
      setIsLiked(liked);
      setIsDisliked(disliked);
      setIsRead(read);
    } catch (error) {
      console.error("Error loading interactions:", error);
    }
  };

  const loadComments = async (type = "book", chapterId = null) => {
    setLoadingComments(true);
    try {
      const response =
        type === "book"
          ? await commentsAPI.getBookComments(bookId)
          : await commentsAPI.getChapterComments(chapterId);
      setComments(response.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para dar like");
      return;
    }

    try {
      if (isLiked) {
        // Remover like
        await interactionsAPI.removeLike(bookId);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // Agregar like
        await interactionsAPI.addLike(bookId);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        // Si tenía dislike, quitarlo
        if (isDisliked) {
          setIsDisliked(false);
          setDislikeCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
      Alert.alert("Error", "No se pudo procesar la acción");
    }
  };

  const handleDislike = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para dar dislike");
      return;
    }

    try {
      if (isDisliked) {
        // Remover dislike
        await interactionsAPI.removeDislike(bookId);
        setIsDisliked(false);
        setDislikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // Agregar dislike
        await interactionsAPI.addDislike(bookId);
        setIsDisliked(true);
        setDislikeCount((prev) => prev + 1);

        // Si tenía like, quitarlo
        if (isLiked) {
          setIsLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error handling dislike:", error);
      Alert.alert("Error", "No se pudo procesar la acción");
    }
  };

  const handleMarkAsRead = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para marcar como leído");
      return;
    }

    try {
      if (isRead) {
        await interactionsAPI.unmarkAsRead(bookId);
        setIsRead(false);
        Alert.alert("✓", "Desmarcado como leído");
      } else {
        await interactionsAPI.markAsRead(bookId);
        setIsRead(true);
        Alert.alert("✓", "Marcado como leído");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      Alert.alert("Error", "No se pudo marcar como leído");
    }
  };

  // ✅ MEJORADA: Función para descargar PDF
  const handleDownloadPDF = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para descargar");
      return;
    }

    if (!book) {
      Alert.alert("Error", "No hay libro para descargar");
      return;
    }

    Alert.alert(
      "Descargar PDF",
      `¿Deseas descargar "${book.title}" como PDF?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descargar",
          onPress: async () => {
            setDownloadingPDF(true);
            try {
              console.log("📥 Iniciando descarga de PDF para libro:", bookId);

              const response = await booksAPI.downloadPDF(bookId);
              console.log("📄 Respuesta del servidor:", response.data);

              // Por ahora solo mostramos que la descarga fue exitosa
              // En una implementación real, aquí manejarías el archivo PDF
              Alert.alert(
                "Información",
                "La funcionalidad de descarga PDF está en desarrollo.\n\nPor ahora puedes leer el libro en la aplicación.",
                [{ text: "OK" }]
              );

              // TODO: Implementar descarga real del PDF
              // Posibles opciones:
              // 1. Usar react-native-fs para guardar el archivo
              // 2. Usar react-native-share para compartir el PDF
              // 3. Abrir el PDF en un visor externo
            } catch (error) {
              console.error("❌ Error downloading PDF:", error);
              Alert.alert(
                "Error",
                "No se pudo descargar el libro. Verifica tu conexión e intenta nuevamente."
              );
            } finally {
              setDownloadingPDF(false);
            }
          },
        },
      ]
    );
  };

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para comentar");
      return;
    }

    if (!newComment.trim()) {
      Alert.alert("Error", "El comentario no puede estar vacío");
      return;
    }

    try {
      const commentData = {
        content: newComment.trim(),
        book_id: commentType === "book" ? bookId : null,
        chapter_id:
          commentType === "chapter" ? selectedChapterForComment : null,
      };

      await commentsAPI.create(commentData);
      setNewComment("");

      // Recargar comentarios
      if (commentType === "book") {
        await loadComments("book");
      } else {
        await loadComments("chapter", selectedChapterForComment);
      }

      Alert.alert("✓", "Comentario publicado");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "No se pudo publicar el comentario");
    }
  };

  const openBookComments = () => {
    setCommentType("book");
    setSelectedChapterForComment(null);
    setShowComments(true);
    loadComments("book");
  };

  const openChapterComments = (chapterId) => {
    setCommentType("chapter");
    setSelectedChapterForComment(chapterId);
    setShowComments(true);
    loadComments("chapter", chapterId);
  };

  const renderComment = (comment) => (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Image
          source={{
            uri: comment.user_profile_image || "https://via.placeholder.com/40",
          }}
          style={styles.commentAvatar}
        />
        <View style={styles.commentUserInfo}>
          <Text style={styles.commentUsername}>{comment.username}</Text>
          <Text style={styles.commentDate}>
            {new Date(comment.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
    </View>
  );

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
        <Text style={styles.errorIcon}>📚</Text>
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
      <ScrollView style={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <Image
          source={{
            uri: book.cover_image_url || "https://via.placeholder.com/300x400",
          }}
          style={styles.coverImage}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>Por {book.writer_name}</Text>

          {book.genre && (
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>{book.genre}</Text>
            </View>
          )}

          {/* Barra de interacción */}
          <View style={styles.interactionBar}>
            <TouchableOpacity
              style={[
                styles.interactionButton,
                isLiked && styles.interactionButtonActive,
              ]}
              onPress={handleLike}
            >
              <Text style={styles.interactionIcon}>👍</Text>
              <Text style={styles.interactionText}>{likeCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.interactionButton,
                isDisliked && styles.interactionButtonActive,
              ]}
              onPress={handleDislike}
            >
              <Text style={styles.interactionIcon}>👎</Text>
              <Text style={styles.interactionText}>{dislikeCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.interactionButton,
                isRead && styles.interactionButtonRead,
              ]}
              onPress={handleMarkAsRead}
            >
              <Text style={styles.interactionIcon}>✓</Text>
              <Text style={styles.interactionText}>
                {isRead ? "Leído" : "Marcar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.interactionButton}
              onPress={handleDownloadPDF}
              disabled={downloadingPDF}
            >
              {downloadingPDF ? (
                <ActivityIndicator size="small" color="#B87D5F" />
              ) : (
                <>
                  <Text style={styles.interactionIcon}>📥</Text>
                  <Text style={styles.interactionText}>PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsis}>
            {book.synopsis || "Sin sinopsis disponible"}
          </Text>

          {/* Botón de comentarios del libro */}
          <TouchableOpacity
            style={styles.commentsButton}
            onPress={openBookComments}
          >
            <Text style={styles.commentsButtonIcon}>💬</Text>
            <Text style={styles.commentsButtonText}>
              Ver comentarios del libro
            </Text>
          </TouchableOpacity>

          {/* ✅ MEJORADO: Renderizado de capítulos */}
          {book.type === "in_app" ? (
            <>
              <Text style={styles.sectionTitle}>
                Capítulos {loadingChapters && "⏳"}
              </Text>

              {loadingChapters ? (
                <View style={styles.loadingChaptersContainer}>
                  <ActivityIndicator size="small" color="#B87D5F" />
                  <Text style={styles.loadingChaptersText}>
                    Cargando capítulos...
                  </Text>
                </View>
              ) : chapters.length > 0 ? (
                chapters.map((chapter) => (
                  <View key={chapter.id}>
                    <TouchableOpacity
                      style={styles.chapterItem}
                      onPress={() => {
                        console.log("📖 Abriendo capítulo:", chapter.title);
                        setSelectedChapter(chapter);
                      }}
                    >
                      <View style={styles.chapterHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.chapterNumber}>
                            Capítulo {chapter.chapter_number}
                          </Text>
                          <Text style={styles.chapterTitle}>
                            {chapter.title}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.chapterCommentButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            openChapterComments(chapter.id);
                          }}
                        >
                          <Text style={styles.chapterCommentIcon}>💬</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    {/* ✅ MEJORADO: Contenido del capítulo */}
                    {selectedChapter?.id === chapter.id && (
                      <View style={styles.chapterContent}>
                        <Text style={styles.chapterContentTitle}>
                          Capítulo {selectedChapter.chapter_number}:{" "}
                          {selectedChapter.title}
                        </Text>
                        <ScrollView style={styles.chapterContentScroll}>
                          <Text style={styles.chapterContentText}>
                            {selectedChapter.content ||
                              "Este capítulo aún no tiene contenido."}
                          </Text>
                        </ScrollView>
                        <TouchableOpacity
                          style={styles.closeChapterButton}
                          onPress={() => {
                            console.log("❌ Cerrando capítulo");
                            setSelectedChapter(null);
                          }}
                        >
                          <Text style={styles.closeChapterText}>
                            Cerrar capítulo
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.noChaptersContainer}>
                  <Text style={styles.noChaptersIcon}>📖</Text>
                  <Text style={styles.noChaptersText}>
                    Este libro aún no tiene capítulos publicados
                  </Text>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity style={styles.readButton}>
              <Text style={styles.readButtonText}>Leer libro completo</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de comentarios */}
      <Modal
        visible={showComments}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {commentType === "book"
                ? "Comentarios del libro"
                : "Comentarios del capítulo"}
            </Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.commentsContainer}>
            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#B87D5F" />
              </View>
            ) : comments.length > 0 ? (
              comments.map(renderComment)
            ) : (
              <View style={styles.emptyComments}>
                <Text style={styles.emptyCommentsIcon}>💬</Text>
                <Text style={styles.emptyCommentsText}>
                  No hay comentarios aún
                </Text>
                <Text style={styles.emptyCommentsSubtext}>
                  Sé el primero en comentar
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe un comentario..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={styles.commentSendButton}
              onPress={handleAddComment}
            >
              <Text style={styles.commentSendIcon}>➤</Text>
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
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
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
    backgroundColor: "#f5f5f5",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    padding: 20,
    paddingTop: 50,
  },
  backButtonText: {
    fontSize: 16,
    color: "#B87D5F",
    fontWeight: "600",
  },
  coverImage: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  author: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  genreTag: {
    backgroundColor: "#B87D5F",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  genreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  interactionButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    minWidth: 70,
  },
  interactionButtonActive: {
    backgroundColor: "#FFF3E0",
  },
  interactionButtonRead: {
    backgroundColor: "#E8F5E9",
  },
  interactionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  interactionText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  synopsis: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  commentsButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  commentsButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  // ✅ NUEVOS ESTILOS
  loadingChaptersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingChaptersText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  noChaptersContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginVertical: 10,
  },
  noChaptersIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noChaptersText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  chapterItem: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#B87D5F",
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapterNumber: {
    fontSize: 12,
    color: "#B87D5F",
    fontWeight: "600",
    marginBottom: 5,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  chapterCommentButton: {
    padding: 8,
  },
  chapterCommentIcon: {
    fontSize: 20,
  },
  chapterContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chapterContentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  chapterContentScroll: {
    maxHeight: 400,
  },
  chapterContentText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
  },
  closeChapterButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#B87D5F",
    borderRadius: 10,
    alignItems: "center",
  },
  closeChapterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  readButton: {
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  readButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  },
  modalCloseButton: {
    fontSize: 28,
    color: "#666",
    fontWeight: "300",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  commentsContainer: {
    flex: 1,
    padding: 20,
  },
  commentItem: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  emptyComments: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  emptyCommentsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: "#999",
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 10,
  },
  commentSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B87D5F",
    justifyContent: "center",
    alignItems: "center",
  },
  commentSendIcon: {
    color: "#fff",
    fontSize: 20,
  },
});
