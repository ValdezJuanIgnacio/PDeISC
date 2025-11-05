import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  Modal,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { booksAPI, chaptersAPI } from "../services/api";
import SimpleTextEditor from "../components/SimpleTextEditor";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

// Lista de géneros disponibles
const GENRES = [
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

export default function WriteScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  // Estados para el libro
  const [bookTitle, setBookTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [currentBookId, setCurrentBookId] = useState(null);
  const [bookStatus, setBookStatus] = useState("draft");

  // Estados para capítulos
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const [showBookSelector, setShowBookSelector] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [publishDebugMessage, setPublishDebugMessage] = useState(null);

  // NUEVO: Estado para modal de confirmación de publicación en web
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const [pendingPublishAction, setPendingPublishAction] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  useEffect(() => {
    loadMyBooks();
    loadDraft();
  }, []);

  // Cargar libros del usuario
  const loadMyBooks = async () => {
    try {
      setLoading(true);
      console.log("📚 Cargando libros del usuario...");
      const response = await booksAPI.getMyBooks();
      setMyBooks(response.data || []);
      console.log("✅ Libros cargados:", response.data?.length);
    } catch (error) {
      console.error("❌ Error loading my books:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar tus libros. Verifica tu conexión."
      );
      setMyBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar capítulos de un libro
  const loadBookChapters = async (bookId) => {
    try {
      setLoading(true);
      console.log("📖 Cargando capítulos del libro:", bookId);
      const response = await chaptersAPI.getByBookId(bookId);
      setChapters(response.data || []);
      console.log("✅ Capítulos cargados:", response.data?.length);
    } catch (error) {
      console.error("❌ Error loading chapters:", error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un libro existente
  const selectExistingBook = async (book) => {
    console.log("📖 Libro seleccionado:", book.title);
    setCurrentBookId(book.id);
    setBookTitle(book.title);
    setGenre(book.genre);
    setSynopsis(book.synopsis);
    setCoverUrl(book.cover_image_url);
    setBookStatus(book.status);
    setShowBookSelector(false);
    setShowBookForm(false);

    // Cargar capítulos del libro
    await loadBookChapters(book.id);
  };

  // Guardar borrador automáticamente
  useEffect(() => {
    if (currentBookId && chapterContent) {
      saveDraft();
    }
  }, [chapterContent]);

  const saveDraft = async () => {
    try {
      const draft = {
        bookId: currentBookId,
        bookTitle,
        chapterTitle,
        chapterContent,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem("chapter_draft", JSON.stringify(draft));
      console.log("💾 Borrador guardado");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const loadDraft = async () => {
    try {
      const draftStr = await AsyncStorage.getItem("chapter_draft");
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        Alert.alert(
          "Borrador encontrado",
          `Se encontró un borrador de "${draft.bookTitle}". ¿Deseas recuperarlo?`,
          [
            { text: "No", style: "cancel" },
            {
              text: "Sí",
              onPress: async () => {
                setCurrentBookId(draft.bookId);
                setBookTitle(draft.bookTitle);
                setChapterTitle(draft.chapterTitle);
                setChapterContent(draft.chapterContent);
                setShowBookForm(false);
                setShowBookSelector(false);
                await loadBookChapters(draft.bookId);
                setEditorMode(true);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem("chapter_draft");
      console.log("🗑️ Borrador eliminado");
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  };

  // ======== FUNCIONES DE MANEJO DE IMAGEN ========

  // Función auxiliar para subir imagen al servidor
  const uploadImageToServer = async (imageUri) => {
    try {
      setLoading(true);
      console.log("📤 Subiendo imagen al servidor:", imageUri);

      const response = await booksAPI.uploadCover(imageUri);

      if (response.data && response.data.url) {
        console.log("✅ Imagen subida correctamente:", response.data.url);
        return response.data.url;
      } else {
        throw new Error("No se recibió URL de la imagen");
      }
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar imagen de la galería
  const pickImageFromGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitas dar permiso para acceder a la galería"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Proporción de portada de libro
        quality: 0.8,
      });

      if (!result.canceled) {
        setShowImagePickerModal(false);

        try {
          // Subir la imagen al servidor
          const uploadedUrl = await uploadImageToServer(result.assets[0].uri);
          setCoverUrl(uploadedUrl);
          Alert.alert("✅ Éxito", "Imagen de portada cargada");
        } catch (error) {
          Alert.alert("Error", "No se pudo subir la imagen al servidor");
        }
      }
    } catch (error) {
      console.error("Error seleccionando imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  // Tomar foto con la cámara
  const takePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitas dar permiso para usar la cámara"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4], // Proporción de portada de libro
        quality: 0.8,
      });

      if (!result.canceled) {
        setShowImagePickerModal(false);

        try {
          // Subir la imagen al servidor
          const uploadedUrl = await uploadImageToServer(result.assets[0].uri);
          setCoverUrl(uploadedUrl);
          Alert.alert("✅ Éxito", "Foto de portada cargada");
        } catch (error) {
          Alert.alert("Error", "No se pudo subir la foto al servidor");
        }
      }
    } catch (error) {
      console.error("Error tomando foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  // ======== FIN FUNCIONES DE MANEJO DE IMAGEN ========

  if (user?.role !== "writer" && user?.role !== "admin") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Solo los escritores pueden acceder a esta sección
        </Text>
        <Text style={styles.errorSubtext}>
          Cambia tu rol a "Escritor" en tu perfil
        </Text>
      </View>
    );
  }

  const handleCreateBook = async () => {
    if (!bookTitle || !genre || !synopsis) {
      Alert.alert("Error", "Por favor completa todos los campos del libro");
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Creando libro...");
      const response = await booksAPI.create({
        title: bookTitle,
        genre,
        synopsis,
        cover_image_url: coverUrl || "https://via.placeholder.com/300x400",
        type: "in_app",
      });

      console.log("✅ Libro creado:", response.data);
      const newBookId = response.data.bookId || response.data.id;
      setCurrentBookId(newBookId);
      setBookStatus("draft");
      setShowBookForm(false);
      setShowBookSelector(false);

      // Recargar mis libros
      await loadMyBooks();
      // Cargar capítulos (estará vacío)
      await loadBookChapters(newBookId);

      Alert.alert("Éxito", "Libro creado. Ahora puedes escribir capítulos.");
    } catch (error) {
      console.error("❌ Error creating book:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo crear el libro"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async () => {
    if (!bookTitle || !genre || !synopsis) {
      Alert.alert("Error", "Por favor completa todos los campos del libro");
      return;
    }

    setLoading(true);
    try {
      console.log("✏️ Actualizando libro:", currentBookId);
      await booksAPI.update(currentBookId, {
        title: bookTitle,
        genre,
        synopsis,
        cover_image_url: coverUrl,
      });

      console.log("✅ Libro actualizado");
      Alert.alert("Éxito", "Información del libro actualizada");
      setShowEditModal(false);

      // Recargar mis libros
      await loadMyBooks();
    } catch (error) {
      console.error("❌ Error updating book:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo actualizar el libro"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChapter = async () => {
    console.log("💾 Intentando guardar capítulo...");
    console.log("📝 Título:", chapterTitle);
    console.log("📖 Contenido length:", chapterContent?.length);
    console.log("📚 Book ID:", currentBookId);

    // Validaciones más estrictas
    if (!chapterTitle?.trim()) {
      Alert.alert("Error", "El capítulo debe tener un título");
      return;
    }

    if (!chapterContent?.trim()) {
      Alert.alert("Error", "El contenido del capítulo no puede estar vacío");
      return;
    }

    if (chapterTitle.length > 255) {
      Alert.alert(
        "Error",
        "El título es demasiado largo (máximo 255 caracteres)"
      );
      return;
    }

    if (!currentBookId) {
      console.error("❌ No hay libro seleccionado");
      Alert.alert("Error", "No hay un libro seleccionado");
      return;
    }

    setLoading(true);
    try {
      const chapterData = {
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
      };

      let response;

      if (currentChapter) {
        // Actualizar capítulo existente
        console.log("📝 Actualizando capítulo:", currentChapter.id);
        console.log("Datos a enviar:", chapterData);
        response = await chaptersAPI.update(currentChapter.id, chapterData);
        Alert.alert("Éxito", "Capítulo actualizado correctamente");
      } else {
        // Crear nuevo capítulo
        console.log("➕ Creando nuevo capítulo para el libro:", currentBookId);
        console.log("Datos a enviar:", {
          ...chapterData,
          book_id: currentBookId,
        });
        response = await chaptersAPI.create({
          ...chapterData,
          book_id: currentBookId,
        });
        Alert.alert("Éxito", "Capítulo guardado correctamente");
      }

      console.log("✅ Operación exitosa:", response.data);

      // Limpiar borrador
      await clearDraft();

      // Recargar capítulos
      await loadBookChapters(currentBookId);

      // Cerrar editor
      setEditorMode(false);
      setCurrentChapter(null);
      setChapterTitle("");
      setChapterContent("");
    } catch (error) {
      console.error("❌ Error saving chapter:", error);
      console.error("Error details:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "No se pudo guardar el capítulo. Por favor intenta nuevamente.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChapter = (chapter) => {
    console.log("✏️ Editando capítulo:", chapter.title);
    setCurrentChapter(chapter);
    setChapterTitle(chapter.title);
    setChapterContent(chapter.content);
    setEditorMode(true);
  };

  const handleDeleteChapter = (chapterId) => {
    Alert.alert(
      "Eliminar capítulo",
      "¿Estás seguro de que deseas eliminar este capítulo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await chaptersAPI.delete(chapterId);
              Alert.alert("Éxito", "Capítulo eliminado");
              await loadBookChapters(currentBookId);
            } catch (error) {
              console.error("Error deleting chapter:", error);
              Alert.alert("Error", "No se pudo eliminar el capítulo");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleNewChapter = () => {
    // Mostrar modal para ingresar título
    setTempTitle("");
    setShowTitleModal(true);
  };

  const handleSubmitTitle = () => {
    if (!tempTitle.trim()) {
      Alert.alert("Error", "El título no puede estar vacío");
      return;
    }
    setChapterTitle(tempTitle.trim());
    setChapterContent("");
    setCurrentChapter(null);
    setShowTitleModal(false);
    setEditorMode(true);
  };

  const ModalTituloCapitulo = () => (
    <Modal
      visible={showTitleModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTitleModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 15,
              textAlign: "center",
            }}
          >
            Título del Capítulo
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el título del capítulo"
            value={tempTitle}
            onChangeText={setTempTitle}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowTitleModal(false)}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSubmitTitle}>
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // NUEVA FUNCIÓN: Publicar o actualizar libro - CON MEJOR MANEJO WEB
  const handlePublishBook = async () => {
    console.log("🚀 Iniciando proceso de publicación...");

    if (!currentBookId) {
      Alert.alert("Error", "No hay libro seleccionado");
      return;
    }

    if (chapters.length === 0) {
      Alert.alert(
        "Error",
        "Debes escribir al menos un capítulo antes de publicar el libro"
      );
      return;
    }

    if (!bookTitle || !genre || !synopsis) {
      Alert.alert(
        "Error",
        "Por favor completa todos los campos del libro (título, género y sinopsis) antes de publicar"
      );
      return;
    }

    const isPublished = bookStatus === "published";
    const action = isPublished ? "actualizar la publicación" : "publicar";
    const title = isPublished ? "Actualizar Publicación" : "Publicar Libro";
    const message = isPublished
      ? "¿Deseas actualizar la publicación de este libro? Los cambios serán visibles inmediatamente para los lectores."
      : "¿Deseas publicar este libro? Será visible para todos los lectores en la sección de Explorar.";

    // Función que ejecuta la publicación
    const executePublish = async () => {
      console.log("🔥 Ejecutando publicación confirmada", {
        action,
        currentBookId,
      });

      setPublishDebugMessage("Iniciando proceso de publicación...");

      let timeoutId;

      // Alert nativo solo en móviles
      if (Platform.OS !== "web") {
        setTimeout(() => {
          Alert.alert("Procesando", "Iniciando proceso de publicación...");
        }, 100);
      }

      // Si tarda, avisar
      timeoutId = setTimeout(() => {
        if (Platform.OS !== "web") {
          Alert.alert(
            "Aviso",
            "El proceso está tardando más de lo esperado, por favor espere..."
          );
        }
        setPublishDebugMessage("Procesando publicación... Por favor espere...");
      }, 15000);

      setLoading(true);
      try {
        console.log(
          `📝 ${isPublished ? "Actualizando" : "Publicando"} libro:`,
          currentBookId
        );

        if (isPublished) {
          console.log("📝 Actualizando información del libro publicado...");
          await booksAPI.update(currentBookId, {
            title: bookTitle,
            genre,
            synopsis,
            cover_image_url: coverUrl,
          });
        }

        console.log(
          `📤 ${isPublished ? "Actualizando" : "Publicando"} libro...`
        );

        let response;
        try {
          response = await booksAPI.publish(currentBookId);
          console.log("📬 Response from publish:", response?.data ?? response);
          const successMessage =
            bookStatus === "published"
              ? "Publicación actualizada exitosamente"
              : "Libro publicado exitosamente";
          setPublishDebugMessage(successMessage);
          setTimeout(() => setPublishDebugMessage(null), 5000);
        } catch (apiError) {
          console.error("📛 API publish error:", apiError);
          const serverMsg =
            apiError?.response?.data ?? apiError?.message ?? apiError;
          setPublishDebugMessage(
            typeof serverMsg === "string"
              ? serverMsg
              : JSON.stringify(serverMsg)
          );
          if (Platform.OS !== "web") {
            Alert.alert("Error de publicación", JSON.stringify(serverMsg));
          } else {
            try {
              window.alert(JSON.stringify(serverMsg));
            } catch (e) {
              console.log("window.alert failed", e);
            }
          }
          throw apiError;
        }

        setBookStatus("published");
        if (Platform.OS !== "web") {
          Alert.alert(
            "Éxito",
            isPublished
              ? "Publicación actualizada correctamente"
              : "Libro publicado exitosamente. Los lectores ya pueden verlo en Explorar."
          );
        } else {
          try {
            window.alert(
              isPublished
                ? "Publicación actualizada correctamente"
                : "Libro publicado exitosamente. Los lectores ya pueden verlo en Explorar."
            );
          } catch (e) {
            console.log("window.alert failed", e);
          }
        }

        await loadMyBooks();
      } catch (error) {
        console.error("❌ Error en publicación:", error);
        const userMessage =
          error?.response?.data?.message ||
          error?.message ||
          `No se pudo ${action} el libro`;
        setPublishDebugMessage(
          `Error: ${
            typeof userMessage === "string"
              ? userMessage
              : JSON.stringify(userMessage)
          }`
        );
        if (Platform.OS !== "web") {
          Alert.alert("Error", userMessage);
        } else {
          try {
            window.alert(userMessage);
          } catch (e) {
            console.log("window.alert failed", e);
          }
        }
        setTimeout(() => {
          setPublishDebugMessage(null);
        }, 8000);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    // CAMBIO PRINCIPAL: Usar modal personalizado en web
    if (Platform.OS === "web") {
      console.log("🌐 Plataforma web detectada - usando modal personalizado");
      // En web, mostrar nuestro propio modal de confirmación
      setPendingPublishAction({
        title,
        message,
        onConfirm: executePublish,
      });
      setShowPublishConfirmModal(true);
    } else {
      // En móvil, usar Alert.alert nativo
      Alert.alert(title, message, [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log("Publicación cancelada (móvil)"),
        },
        {
          text: isPublished ? "Actualizar" : "Publicar",
          onPress: executePublish,
        },
      ]);
    }
  };

  // NUEVO: Modal de confirmación para web
  const PublishConfirmModal = () => (
    <Modal
      visible={showPublishConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPublishConfirmModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 450,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 12,
              color: "#333",
              textAlign: "center",
            }}
          >
            {pendingPublishAction?.title || "Confirmar"}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#666",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 24,
            }}
          >
            {pendingPublishAction?.message || "¿Deseas continuar?"}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                console.log("Publicación cancelada por el usuario (web modal)");
                setShowPublishConfirmModal(false);
                setPendingPublishAction(null);
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4CAF50" }]}
              onPress={async () => {
                console.log(
                  "Publicación confirmada por el usuario (web modal)"
                );
                setShowPublishConfirmModal(false);
                if (pendingPublishAction?.onConfirm) {
                  await pendingPublishAction.onConfirm();
                }
                setPendingPublishAction(null);
              }}
            >
              <Text style={styles.buttonText}>
                {bookStatus === "published" ? "Actualizar" : "Publicar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Función para desbloquear (volver a draft)
  const handleUnpublishBook = async () => {
    if (!currentBookId) {
      Alert.alert("Error", "No hay libro seleccionado");
      return;
    }

    if (bookStatus !== "published") {
      Alert.alert(
        "Aviso",
        "Este libro no está publicado, no es necesario despublicarlo"
      );
      return;
    }

    const confirmMessage =
      "¿Deseas desbloquear este libro? Dejará de ser visible en la biblioteca pública y podrás editarlo nuevamente.";

    const executeUnpublish = async () => {
      setLoading(true);
      try {
        console.log("🔓 Desbloqueando libro:", currentBookId);
        await booksAPI.update(currentBookId, { status: "draft" });

        setBookStatus("draft");
        Alert.alert(
          "Éxito",
          "Libro desbloqueado. Ahora puedes editar capítulos."
        );

        await loadMyBooks();
      } catch (error) {
        console.error("❌ Error al desbloquear:", error);
        Alert.alert(
          "Error",
          error.response?.data?.message || "No se pudo desbloquear el libro"
        );
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        await executeUnpublish();
      }
    } else {
      Alert.alert("Desbloquear Libro", confirmMessage, [
        { text: "Cancelar", style: "cancel" },
        { text: "Desbloquear", onPress: executeUnpublish },
      ]);
    }
  };

  // ======== RENDERIZADO ========

  // Si está en modo editor
  if (editorMode) {
    return (
      <View style={styles.editorContainer}>
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={() => setEditorMode(false)}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.editorTitle}>{bookTitle}</Text>
          <TouchableOpacity onPress={handleSaveChapter} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#B87D5F" />
            ) : (
              <Text style={styles.saveButton}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.chapterTitleContainer}>
          <TextInput
            style={styles.chapterTitleInput}
            placeholder="Título del capítulo"
            value={chapterTitle}
            onChangeText={setChapterTitle}
          />
        </View>

        <SimpleTextEditor
          initialContent={chapterContent}
          onContentChange={setChapterContent}
          placeholder="Escribe tu capítulo aquí..."
        />
      </View>
    );
  }

  // Si se está creando un nuevo libro
  if (showBookForm) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Nuevo Libro</Text>
            <TouchableOpacity onPress={() => setShowBookForm(false)}>
              <Text style={styles.backButton}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Crear Nuevo Libro</Text>
          <Text style={styles.formSubtitle}>
            Completa la información de tu libro
          </Text>

          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Título del libro"
            value={bookTitle}
            onChangeText={setBookTitle}
          />

          <Text style={styles.label}>Género *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={genre}
              onValueChange={(value) => setGenre(value)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un género" value="" />
              {GENRES.map((g) => (
                <Picker.Item key={g} label={g} value={g} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Sinopsis *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu libro"
            value={synopsis}
            onChangeText={setSynopsis}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Portada del libro (opcional)</Text>

          {coverUrl ? (
            <View style={styles.coverPreviewContainer}>
              <Image
                source={{ uri: coverUrl }}
                style={styles.coverPreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changeCoverButton}
                onPress={() => setShowImagePickerModal(true)}
              >
                <Text style={styles.changeCoverButtonText}>
                  Cambiar portada
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectImageButton}
              onPress={() => setShowImagePickerModal(true)}
            >
              <Text style={styles.selectImageButtonText}>
                📷 Seleccionar imagen
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateBook}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear Libro</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Si se está mostrando el selector de libros
  if (showBookSelector) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Libros</Text>
          <Text style={styles.headerSubtitle}>
            {myBooks.length} {myBooks.length === 1 ? "libro" : "libros"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona un libro</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#B87D5F"
              style={styles.loader}
            />
          ) : myBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No tienes libros creados
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Crea tu primer libro para comenzar a escribir
              </Text>
            </View>
          ) : (
            <FlatList
              data={myBooks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bookItem}
                  onPress={() => selectExistingBook(item)}
                >
                  <View style={styles.bookItemHeader}>
                    <Text style={styles.bookItemTitle}>{item.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.status === "published"
                              ? "#4CAF50"
                              : item.status === "submitted"
                              ? "#FF9800"
                              : "#999",
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {item.status === "published"
                          ? "Publicado"
                          : item.status === "submitted"
                          ? "Enviado"
                          : "Borrador"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.bookItemGenre}>{item.genre}</Text>
                  <Text style={styles.bookItemSynopsis} numberOfLines={2}>
                    {item.synopsis}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setShowBookForm(true);
              setShowBookSelector(false);
              setBookTitle("");
              setGenre("");
              setSynopsis("");
              setCoverUrl("");
            }}
          >
            <Text style={styles.buttonText}>+ Crear Nuevo Libro</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Vista principal: libro seleccionado con lista de capítulos
  const renderChapterItem = ({ item, index }) => (
    <View style={styles.chapterItem}>
      <View style={styles.chapterItemHeader}>
        <Text style={styles.chapterNumber}>Capítulo {index + 1}</Text>
        <Text style={styles.chapterDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.chapterItemTitle}>{item.title}</Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TouchableOpacity
          style={[styles.button, { flex: 1 }]}
          onPress={() => handleEditChapter(item)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { flex: 1 }]}
          onPress={() => handleDeleteChapter(item.id)}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "published":
        return "#4CAF50";
      case "submitted":
        return "#FF9800";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "Publicado ✅";
      case "submitted":
        return "Enviado";
      default:
        return "Borrador";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => setShowBookSelector(true)}>
            <Text style={styles.backButton}>← Cambiar libro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{bookTitle}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBadgeColor(bookStatus) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusLabel(bookStatus)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.editButtonText}>Editar Info</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          {chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"}
        </Text>
      </View>

      {/* Banner de debug */}
      {publishDebugMessage && (
        <View
          style={{
            backgroundColor: "#FFF9C4",
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#FDD835",
          }}
        >
          <Text style={{ color: "#F57F17", textAlign: "center", fontSize: 13 }}>
            {publishDebugMessage}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#B87D5F" style={styles.loader} />
      ) : (
        <ScrollView style={styles.chapterListContainer}>
          {chapters.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay capítulos aún</Text>
              <Text style={styles.emptyStateSubtext}>
                Comienza a escribir tu historia
              </Text>
            </View>
          ) : (
            <FlatList
              data={chapters}
              renderItem={renderChapterItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}

          {/* Sección de publicación */}
          {bookStatus === "draft" && chapters.length > 0 && (
            <View style={styles.publishSection}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#4CAF50" }]}
                onPress={handlePublishBook}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>📚 Publicar Libro</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.publishInfo}>
                Al publicar, tu libro será visible en la biblioteca pública para
                todos los lectores.
              </Text>
            </View>
          )}

          {bookStatus === "published" && (
            <View style={styles.publishSection}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#2196F3" }]}
                onPress={handlePublishBook}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    🔄 Actualizar Publicación
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.publishInfo}>
                Tu libro está publicado. Puedes actualizar la información o
                desbloquearlo para editar capítulos.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { marginTop: 15 }]}
            onPress={handleNewChapter}
          >
            <Text style={styles.buttonText}>+ Nuevo Capítulo</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Modal para editar información del libro */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Libro</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Título del libro"
              value={bookTitle}
              onChangeText={setBookTitle}
            />

            <Text style={styles.label}>Género *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={genre}
                onValueChange={(value) => setGenre(value)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona un género" value="" />
                {GENRES.map((g) => (
                  <Picker.Item key={g} label={g} value={g} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Sinopsis *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu libro"
              value={synopsis}
              onChangeText={setSynopsis}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Portada del libro (opcional)</Text>

            {coverUrl ? (
              <View style={styles.coverPreviewContainer}>
                <Image
                  source={{ uri: coverUrl }}
                  style={styles.coverPreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.changeCoverButton}
                  onPress={() => setShowImagePickerModal(true)}
                >
                  <Text style={styles.changeCoverButtonText}>
                    Cambiar portada
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectImageButton}
                onPress={() => setShowImagePickerModal(true)}
              >
                <Text style={styles.selectImageButtonText}>
                  📷 Seleccionar imagen
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateBook}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal para título del capítulo */}
      <ModalTituloCapitulo />

      {/* Modal para seleccionar imagen de portada */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imagePickerModalContent}>
            <Text style={styles.imagePickerModalTitle}>
              Seleccionar Portada
            </Text>

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.imagePickerOptionText}>
                🖼️ Elegir de la galería
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={takePhoto}
            >
              <Text style={styles.imagePickerOptionText}>
                📸 Tomar una foto
              </Text>
            </TouchableOpacity>

            {coverUrl && (
              <TouchableOpacity
                style={[styles.imagePickerOption, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setCoverUrl("");
                  setShowImagePickerModal(false);
                  Alert.alert(
                    "Portada eliminada",
                    "Se ha eliminado la imagen de portada"
                  );
                }}
              >
                <Text
                  style={[styles.imagePickerOptionText, { color: "#FF5252" }]}
                >
                  🗑️ Eliminar portada actual
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.imagePickerOption, styles.imagePickerCancel]}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={styles.imagePickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* NUEVO: Modal de confirmación de publicación para web */}
      <PublishConfirmModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "serif",
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  backButtonContainer: {
    marginBottom: 10,
  },
  backButton: {
    fontSize: 16,
    color: "#B87D5F",
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#B87D5F",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  loader: {
    marginVertical: 30,
  },
  bookItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#B87D5F",
  },
  bookItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  bookItemGenre: {
    fontSize: 12,
    color: "#B87D5F",
    fontWeight: "600",
    marginBottom: 5,
  },
  bookItemSynopsis: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#B87D5F",
  },
  cancelButtonText: {
    color: "#B87D5F",
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  picker: {
    height: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  editorContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    fontSize: 16,
    color: "#B87D5F",
    fontWeight: "bold",
  },
  chapterTitleContainer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  chapterTitleInput: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  chapterListContainer: {
    flex: 1,
    padding: 20,
  },
  chapterItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#B87D5F",
  },
  chapterItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chapterNumber: {
    fontSize: 12,
    color: "#B87D5F",
    fontWeight: "600",
  },
  chapterDate: {
    fontSize: 12,
    color: "#999",
  },
  chapterItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  modalCloseButton: {
    fontSize: 28,
    color: "#999",
    fontWeight: "300",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  publishSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  publishInfo: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  unpublishButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F44336",
  },
  coverPreviewContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  coverPreview: {
    width: 200,
    height: 267,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  changeCoverButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  changeCoverButtonText: {
    color: "#B87D5F",
    fontSize: 14,
    fontWeight: "600",
  },
  selectImageButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  selectImageButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 0,
    width: "85%",
    maxWidth: 400,
    overflow: "hidden",
  },
  imagePickerModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    padding: 20,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  imagePickerOption: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  imagePickerOptionText: {
    fontSize: 16,
    color: "#2C3E50",
    textAlign: "center",
    fontWeight: "500",
  },
  imagePickerCancel: {
    borderBottomWidth: 0,
    backgroundColor: "#f5f5f5",
  },
  imagePickerCancelText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
  },
});
