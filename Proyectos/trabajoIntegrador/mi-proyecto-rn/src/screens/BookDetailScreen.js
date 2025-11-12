import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  Linking,
} from "react-native";
import { booksAPI, interactionsAPI, commentsAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { CustomAlert } from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  CheckIcon,
  CheckCircleIcon,
  EyeIcon,
  CommentIcon,
  DownloadIcon,
  ArrowRightIcon,
  CloseIcon,
  SendIcon,
  HomeIcon,
} from "../components/CustomIcons";

export default function BookDetailScreen({ route, navigation }) {
  const { bookId } = route.params;
  const { user } = useContext(AuthContext);
  const { alertConfig, showAlert, hideAlert } = useCustomAlert();

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
      console.log("Registrando visualización del libro:", bookId);
      const response = await booksAPI.registerView(bookId);
      if (response.data?.view_count) {
        setViewCount(response.data.view_count);
      }
    } catch (error) {
      console.error("Error al registrar visualización:", error);
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
      console.error("Error loading book:", error);
      showAlert({
        title: "Error",
        message: "No se pudo cargar la información del libro",
        type: "error",
        buttons: [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      });
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
      console.error("Error loading interactions:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showAlert({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para dar like a los libros",
        type: "warning",
      });
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
      showAlert({
        title: "Error",
        message: "No se pudo procesar tu reacción",
        type: "error",
      });
    }
  };

  const handleDislike = async () => {
    if (!user) {
      showAlert({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para dar dislike a los libros",
        type: "warning",
      });
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
      showAlert({
        title: "Error",
        message: "No se pudo procesar tu reacción",
        type: "error",
      });
    }
  };

  const handleMarkAsRead = async () => {
    if (!user) {
      showAlert({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para marcar libros como leídos",
        type: "warning",
      });
      return;
    }

    try {
      if (isRead) {
        await interactionsAPI.unmarkAsRead(bookId);
        setIsRead(false);
        showAlert({
          title: "Listo",
          message: "Libro desmarcado como leído",
          type: "info",
        });
      } else {
        await interactionsAPI.markAsRead(bookId);
        setIsRead(true);
        showAlert({
          title: "¡Genial!",
          message: "Libro marcado como leído",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      showAlert({
        title: "Error",
        message: "No se pudo marcar el libro",
        type: "error",
      });
    }
  };

  // Función auxiliar para convertir Blob a Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  };

  // Función mejorada para descargar capítulos
  const handleDownloadChapter = async (chapter) => {
    if (!user) {
      showAlert({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para descargar capítulos",
        type: "warning",
      });
      return;
    }

    try {
      setDownloadingChapter(chapter.id);
      console.log("Descargando capítulo:", chapter.id);

      const response = await booksAPI.downloadChapterPDF(bookId, chapter.id);

      if (Platform.OS === "web") {
        // Para web
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${book.title}_Capitulo_${chapter.chapter_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showAlert({
          title: "Descarga completa",
          message: "El capítulo se ha descargado exitosamente",
          type: "success",
        });
      } else {
        // Para móvil (Android/iOS)
        const filename = `${book.title.replace(/[^a-z0-9]/gi, "_")}_Cap${
          chapter.chapter_number
        }.pdf`;

        // Pedir permisos
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== "granted") {
          showAlert({
            title: "Permisos necesarios",
            message: "Se necesitan permisos para guardar el archivo",
            type: "warning",
          });
          return;
        }

        // Guardar temporalmente
        const fileUri = FileSystem.documentDirectory + filename;

        // Convertir blob a base64
        const base64 = await blobToBase64(response.data);

        // Escribir archivo
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log("Archivo guardado en:", fileUri);

        // Intentar guardar en galería/descargas
        try {
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync("Artemis", asset, false);

          showAlert({
            title: "Descarga completa",
            message: "El PDF se guardó en la carpeta 'Artemis'",
            type: "success",
            buttons: [
              {
                text: "Compartir",
                onPress: async () => {
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri);
                  }
                },
              },
              { text: "OK" },
            ],
          });
        } catch (error) {
          // Si falla guardar en galería, compartir el archivo
          console.warn("No se pudo guardar en galería, compartiendo...");

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: "application/pdf",
              dialogTitle: "Guardar PDF",
              UTI: "public.pdf",
            });

            showAlert({
              title: "Archivo listo",
              message: "El PDF está listo para compartir o guardar",
              type: "success",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error descargando capítulo:", error);
      showAlert({
        title: "Error",
        message:
          "No se pudo descargar el capítulo. Por favor intenta nuevamente.",
        type: "error",
      });
    } finally {
      setDownloadingChapter(null);
    }
  };

  const handleDownloadBook = async () => {
    if (!user) {
      showAlert({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para descargar libros",
        type: "warning",
      });
      return;
    }

    if (chapters.length === 0) {
      showAlert({
        title: "Sin capítulos",
        message: "Este libro no tiene capítulos para descargar",
        type: "info",
      });
      return;
    }

    try {
      setLoading(true);
      console.log(`Descargando ${chapters.length} capítulos...`);

      // Descargar todos los capítulos secuencialmente
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        console.log(
          `Descargando capítulo ${i + 1} de ${chapters.length}: ${
            chapter.title
          }`
        );

        await handleDownloadChapter(chapter);

        // Pequeña pausa entre descargas
        if (i < chapters.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      showAlert({
        title: "Descarga Completa",
        message: `Se descargaron todos los ${chapters.length} capítulos exitosamente`,
        type: "success",
      });
      console.log("Descarga de todos los capítulos completada");
    } catch (error) {
      console.error("Error descargando el libro completo:", error);
      showAlert({
        title: "Error",
        message:
          "Ocurrió un error al descargar algunos capítulos. Revisa tu conexión e intenta nuevamente.",
        type: "error",
      });
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
      showAlert({
        title: "Error",
        message: "No se pudieron cargar los comentarios",
        type: "error",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      showAlert({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para comentar en los libros",
        type: "warning",
      });
      return;
    }

    if (!newComment.trim()) {
      showAlert({
        title: "Error",
        message: "El comentario no puede estar vacío",
        type: "error",
      });
      return;
    }

    try {
      await commentsAPI.create({
        content: newComment,
        book_id: bookId,
      });

      setNewComment("");
      showAlert({
        title: "Éxito",
        message: "Comentario publicado",
        type: "success",
      });
      await loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      showAlert({
        title: "Error",
        message: "No se pudo publicar el comentario",
        type: "error",
      });
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
    setShowChapterModal(false);
    setSelectedChapter(null);
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
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Botón para volver a la biblioteca */}
          <TouchableOpacity
            style={styles.backToLibraryButton}
            onPress={() => navigation.navigate("LibraryMain")}
          >
            <HomeIcon size={20} color="#B87D5F" />
            <Text style={styles.backToLibraryText}>Volver a Explorar</Text>
          </TouchableOpacity>

          {/* Portada del libro */}
          {book.cover_image_url && (
            <Image
              source={{ uri: book.cover_image_url }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}

          {/* Información del libro */}
          <View style={styles.infoSection}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>Por {book.author?.username}</Text>
            <View style={styles.genreContainer}>
              <Text style={styles.genreText}>{book.genre}</Text>
            </View>

            {/* Botones de interacción */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.iconButton, isLiked && styles.iconButtonLiked]}
                onPress={handleLike}
              >
                <ThumbsUpIcon
                  size={28}
                  color={isLiked ? "#4CAF50" : "#999"}
                  filled={isLiked}
                />
                <Text style={styles.iconButtonCount}>{likeCount}</Text>
                <Text style={styles.iconButtonLabel}>Me gusta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.iconButton,
                  isDisliked && styles.iconButtonDisliked,
                ]}
                onPress={handleDislike}
              >
                <ThumbsDownIcon
                  size={28}
                  color={isDisliked ? "#F44336" : "#999"}
                  filled={isDisliked}
                />
                <Text style={styles.iconButtonCount}>{dislikeCount}</Text>
                <Text style={styles.iconButtonLabel}>No me gusta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconButton, isRead && styles.iconButtonRead]}
                onPress={handleMarkAsRead}
              >
                {isRead ? (
                  <CheckCircleIcon size={28} color="#2196F3" />
                ) : (
                  <CheckIcon size={28} color="#999" />
                )}
                <Text style={styles.iconButtonLabel}>
                  {isRead ? "Leído" : "Marcar"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Estadísticas */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <EyeIcon size={18} color="#666" />
                <Text style={styles.statText}>{viewCount} visualizaciones</Text>
              </View>
            </View>
          </View>

          {/* Sinopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text style={styles.synopsis}>{book.synopsis}</Text>
          </View>

          {/* Comentarios */}
          <TouchableOpacity
            style={styles.commentsToggleButton}
            onPress={toggleComments}
          >
            <View style={styles.commentsToggleContent}>
              <CommentIcon size={24} color="#B87D5F" />
              <Text style={styles.commentsToggleText}>
                {showComments ? "Ocultar comentarios" : "Ver comentarios"}
              </Text>
              {comments.length > 0 && (
                <View style={styles.commentCountBadge}>
                  <Text style={styles.commentCountText}>{comments.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

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
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleAddComment}
                  >
                    <SendIcon size={20} color="#FFF" />
                    <Text style={styles.sendButtonText}>
                      Publicar comentario
                    </Text>
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
                <ActivityIndicator size="small" color="#B87D5F" />
              ) : comments.length === 0 ? (
                <Text style={styles.noCommentsText}>
                  Aún no hay comentarios. ¡Sé el primero!
                </Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>
                        {comment.user?.username || "Usuario"}
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

          {/* Capítulos */}
          {chapters.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Capítulos ({chapters.length})
              </Text>

              {chapters.map((chapter) => (
                <View key={chapter.id} style={styles.chapterCard}>
                  <TouchableOpacity
                    style={styles.chapterMainContent}
                    onPress={() => openChapter(chapter)}
                  >
                    <View style={styles.chapterHeader}>
                      <Text style={styles.chapterNumber}>
                        Capítulo {chapter.chapter_number}
                      </Text>
                      <ArrowRightIcon size={20} color="#B87D5F" />
                    </View>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text
                      style={styles.chapterPreview}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {chapter.content}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.downloadChapterButton}
                    onPress={() => handleDownloadChapter(chapter)}
                    disabled={downloadingChapter === chapter.id}
                  >
                    {downloadingChapter === chapter.id ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <DownloadIcon size={18} color="#FFF" />
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
              <CloseIcon size={28} color="#666" />
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
              <DownloadIcon size={24} color="#B87D5F" />
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

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  content: {
    padding: 20,
  },
  backToLibraryButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#B87D5F",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backToLibraryText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#B87D5F",
  },
  coverImage: {
    width: "100%",
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  genreContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#B87D5F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 20,
  },
  genreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 15,
    marginBottom: 10,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    minWidth: 90,
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
  iconButtonCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  iconButtonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 2,
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
    gap: 6,
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
    gap: 10,
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
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
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
    gap: 8,
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
