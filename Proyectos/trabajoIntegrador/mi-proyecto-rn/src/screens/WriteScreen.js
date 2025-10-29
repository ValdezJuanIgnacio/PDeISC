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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { booksAPI, chaptersAPI } from "../services/api";
import SimpleTextEditor from "../components/SimpleTextEditor";
import { Picker } from "@react-native-picker/picker";

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
  const [bookStatus, setBookStatus] = useState("draft"); // NUEVO: Estado del libro

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
  // Mensaje de depuración visible en pantalla (útil para web donde Alert puede fallar)
  const [publishDebugMessage, setPublishDebugMessage] = useState(null);

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
    console.log("📗 Libro seleccionado:", book.title);
    setCurrentBookId(book.id);
    setBookTitle(book.title);
    setGenre(book.genre);
    setSynopsis(book.synopsis);
    setCoverUrl(book.cover_image_url);
    setBookStatus(book.status); // NUEVO: Guardar el estado del libro
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
      console.log("📗 Creando libro...");
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
      setBookStatus("draft"); // NUEVO: El libro comienza como draft
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

        if (!response?.data) {
          throw new Error("No se recibió respuesta del servidor al actualizar");
        }

        console.log("✅ Capítulo actualizado correctamente");
        Alert.alert("Éxito", "Capítulo actualizado");
      } else {
        // Crear nuevo capítulo
        console.log("📝 Creando nuevo capítulo");
        console.log("Datos a enviar:", {
          ...chapterData,
          book_id: currentBookId,
          chapter_number: chapters.length + 1,
        });

        response = await chaptersAPI.create({
          ...chapterData,
          book_id: currentBookId,
          chapter_number: chapters.length + 1,
        });

        if (!response?.data) {
          throw new Error("No se recibió respuesta del servidor al crear");
        }

        console.log("✅ Capítulo creado correctamente");
        Alert.alert("Éxito", "Capítulo guardado");
      }

      // Limpiar el editor
      setChapterTitle("");
      setChapterContent("");
      setCurrentChapter(null);
      setEditorMode(false);
      clearDraft();

      // Recargar capítulos
      await loadBookChapters(currentBookId);
    } catch (error) {
      console.error("❌ Error saving chapter:", error);
      console.error("Error completo:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "No se pudo guardar el capítulo. Verifica que todos los campos estén completos.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChapter = (chapter) => {
    console.log("✏️ Editando capítulo:", chapter.id);
    setCurrentChapter(chapter);
    setChapterTitle(chapter.title);
    setChapterContent(chapter.content);
    setEditorMode(true);
  };

  const handleDeleteChapter = (chapter) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar el capítulo "${chapter.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              console.log("🗑️ Eliminando capítulo:", chapter.id);
              await chaptersAPI.delete(chapter.id);
              console.log("✅ Capítulo eliminado");
              Alert.alert("Éxito", "Capítulo eliminado");
              await loadBookChapters(currentBookId);
            } catch (error) {
              console.error("❌ Error deleting chapter:", error);
              Alert.alert("Error", "No se pudo eliminar el capítulo");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmitTitle = () => {
    if (!tempTitle.trim()) {
      Alert.alert("Error", "El título no puede estar vacío");
      return;
    }
    setChapterTitle(tempTitle);
    setTempTitle("");
    setShowTitleModal(false);
    setEditorMode(true);
  };

  const renderTitleModal = () => (
    <Modal
      animationType="fade"
      visible={showTitleModal}
      transparent={true}
      onRequestClose={() => setShowTitleModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nuevo Capítulo</Text>
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

  // NUEVA FUNCIÓN: Publicar o actualizar libro
  const handlePublishBook = async () => {
    console.log("🔵 Iniciando proceso de publicación...");

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

    // Extraemos la lógica de publicación para poder invocarla desde web (window.confirm)
    const publishConfirmed = async () => {
      console.log("🔔 Usuario confirmó acción de publicación", {
        action,
        currentBookId,
      });

      // Mostrar mensaje inicial en el banner
      setPublishDebugMessage("Iniciando proceso de publicación...");

      // timeout para mensajes largos
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
            // En web mostramos también un alert de navegador para visibilidad
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

    // En web usar confirm ya que Alert.alert no muestra botones
    if (Platform.OS === "web") {
      let confirmed = false;
      try {
        confirmed = window.confirm(message);
      } catch (e) {
        console.log("window.confirm failed", e);
      }
      if (!confirmed) {
        console.log("Publicación cancelada (web)");
        return;
      }
      await publishConfirmed();
    } else {
      Alert.alert(title, message, [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log("Publicación cancelada"),
        },
        {
          text: action === "publicar" ? "Publicar" : "Actualizar",
          style: "default",
          onPress: publishConfirmed,
        },
      ]);
    }
  };

  // NUEVA FUNCIÓN: Despublicar libro
  const handleUnpublishBook = async () => {
    if (!currentBookId) {
      Alert.alert("Error", "No hay libro seleccionado");
      return;
    }

    Alert.alert(
      "Despublicar Libro",
      "¿Deseas quitar este libro de la sección pública? Ya no será visible para los lectores.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Despublicar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              console.log("📥 Despublicando libro...");
              // Cambiar el status a draft mediante update
              await booksAPI.update(currentBookId, {
                title: bookTitle,
                genre,
                synopsis,
                cover_image_url: coverUrl,
                status: "draft",
              });

              setBookStatus("draft");
              Alert.alert("Éxito", "Libro despublicado correctamente");
              await loadMyBooks();
            } catch (error) {
              console.error("❌ Error al despublicar:", error);
              Alert.alert("Error", "No se pudo despublicar el libro");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setBookTitle("");
    setGenre("");
    setSynopsis("");
    setCoverUrl("");
    setChapterTitle("");
    setChapterContent("");
    setCurrentBookId(null);
    setCurrentChapter(null);
    setChapters([]);
    setBookStatus("draft");
    setShowBookForm(false);
    setShowBookSelector(true);
    setEditorMode(false);
    clearDraft();
    loadMyBooks();
  };

  const openEditBookModal = () => {
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "#999";
      case "submitted":
        return "#FF9800";
      case "published":
        return "#4CAF50";
      case "archived":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "draft":
        return "Borrador";
      case "submitted":
        return "En revisión";
      case "published":
        return "Publicado";
      case "archived":
        return "Archivado";
      default:
        return status;
    }
  };

  // Vista de selección de libro
  if (showBookSelector) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Escribir</Text>
          <Text style={styles.headerSubtitle}>
            Selecciona un libro o crea uno nuevo
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Libros</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#B87D5F"
              style={styles.loader}
            />
          ) : myBooks.length > 0 ? (
            myBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookItem}
                onPress={() => selectExistingBook(book)}
              >
                <View style={styles.bookItemHeader}>
                  <Text style={styles.bookItemTitle}>{book.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(book.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusLabel(book.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bookItemGenre}>{book.genre}</Text>
                <Text style={styles.bookItemSynopsis} numberOfLines={2}>
                  {book.synopsis}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No tienes libros todavía
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Crea tu primer libro para comenzar a escribir
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setShowBookSelector(false);
              setShowBookForm(true);
            }}
          >
            <Text style={styles.buttonText}>+ Crear Nuevo Libro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Vista del formulario de libro
  if (showBookForm) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setShowBookForm(false);
              setShowBookSelector(true);
              // Limpiar el formulario
              setBookTitle("");
              setGenre("");
              setSynopsis("");
              setCoverUrl("");
            }}
            style={styles.backButtonContainer}
          >
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Crear Nuevo Libro</Text>
          <Text style={styles.formSubtitle}>
            Completa la información básica
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Título del libro"
            value={bookTitle}
            onChangeText={setBookTitle}
          />

          <Text style={styles.label}>Género</Text>
          {Platform.OS === "web" ? (
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 10,
                marginBottom: 15,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#e0e0e0",
              }}
            >
              <option value="">Selecciona un género</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          ) : (
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
          )}

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Sinopsis"
            value={synopsis}
            onChangeText={setSynopsis}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={styles.input}
            placeholder="URL de la imagen de portada (opcional)"
            value={coverUrl}
            onChangeText={setCoverUrl}
          />

          <TouchableOpacity style={styles.button} onPress={handleCreateBook}>
            <Text style={styles.buttonText}>Crear Libro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Vista del editor de capítulos
  if (editorMode) {
    return (
      <View style={styles.editorContainer}>
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={() => setEditorMode(false)}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.editorTitle}>
            {currentChapter ? "Editar Capítulo" : "Nuevo Capítulo"}
          </Text>
          <TouchableOpacity onPress={handleSaveChapter} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#B87D5F" />
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
          key={currentChapter?.id || "new"} // ⭐ ESTA ES LA LÍNEA NUEVA
          initialContent={chapterContent}
          onContentChange={setChapterContent}
          placeholder="Escribe tu capítulo aquí..."
        />
      </View>
    );
  }

  // Vista principal con lista de capítulos
  return (
    <View style={styles.container}>
      {publishDebugMessage && (
        <View
          style={[
            styles.debugBanner,
            publishDebugMessage.startsWith("Error") && styles.debugBannerError,
            publishDebugMessage.startsWith("Libro publicado") &&
              styles.debugBannerSuccess,
            publishDebugMessage.startsWith("Procesando") &&
              styles.debugBannerWarning,
          ]}
        >
          <Text style={styles.debugBannerText}>{publishDebugMessage}</Text>
        </View>
      )}
      {renderTitleModal()}

      {/* Modal de edición de libro */}
      <Modal
        animationType="slide"
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Libro</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Título del libro"
              value={bookTitle}
              onChangeText={setBookTitle}
            />

            <Text style={styles.label}>Género</Text>
            {Platform.OS === "web" ? (
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                style={{
                  backgroundColor: "#fff",
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 15,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                }}
              >
                <option value="">Selecciona un género</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            ) : (
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
            )}

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Sinopsis"
              value={synopsis}
              onChangeText={setSynopsis}
              multiline
              numberOfLines={4}
            />

            <TextInput
              style={styles.input}
              placeholder="URL de la imagen de portada"
              value={coverUrl}
              onChangeText={setCoverUrl}
            />

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

      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.backButtonContainer}>
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.backButton}>← Volver</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>{bookTitle}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={openEditBookModal}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>{genre}</Text>

          {/* NUEVO: Indicador de estado de publicación */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(bookStatus), marginTop: 10 },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(bookStatus)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capítulos ({chapters.length})</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#B87D5F"
              style={styles.loader}
            />
          ) : chapters.length > 0 ? (
            chapters.map((chapter) => (
              <View key={chapter.id} style={styles.chapterItem}>
                <View style={styles.chapterItemHeader}>
                  <View>
                    <Text style={styles.chapterNumber}>
                      Capítulo {chapter.chapter_number}
                    </Text>
                    <Text style={styles.chapterItemTitle}>{chapter.title}</Text>
                  </View>
                  <Text style={styles.chapterDate}>
                    {new Date(chapter.created_at).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.actionBar}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditChapter(chapter)}
                  >
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#F44336" },
                    ]}
                    onPress={() => handleDeleteChapter(chapter)}
                  >
                    <Text style={styles.actionButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hay capítulos todavía
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Crea tu primer capítulo para comenzar
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowTitleModal(true)}
          >
            <Text style={styles.buttonText}>+ Nuevo Capítulo</Text>
          </TouchableOpacity>

          {/* NUEVO: Botón de publicar/actualizar */}
          {chapters.length > 0 && (
            <View style={styles.publishSection}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitActionButton,
                  bookStatus === "published" && styles.updateButton,
                ]}
                onPress={handlePublishBook}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {bookStatus === "published"
                      ? "✓ Actualizar Publicación"
                      : "📤 Publicar Libro"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Botón de despublicar si está publicado */}
              {bookStatus === "published" && (
                <TouchableOpacity
                  style={[styles.button, styles.unpublishButton]}
                  onPress={handleUnpublishBook}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: "#F44336" }]}>
                    Despublicar
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.publishInfo}>
                {bookStatus === "published"
                  ? "Tu libro es visible en la sección Explorar. Puedes editar capítulos y actualizar la publicación."
                  : "Publica tu libro para que sea visible en la sección Explorar para todos los lectores."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  debugBanner: {
    backgroundColor: "#333",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  debugBannerSuccess: {
    backgroundColor: "#4CAF50",
  },
  debugBannerError: {
    backgroundColor: "#F44336",
  },
  debugBannerWarning: {
    backgroundColor: "#FF9800",
  },
  debugBannerText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    flex: 1,
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
  actionBar: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#B87D5F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitActionButton: {
    backgroundColor: "#4CAF50",
  },
  updateButton: {
    backgroundColor: "#2196F3",
  },
  unpublishButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
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
  // NUEVOS ESTILOS para la sección de publicación
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
});
