import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";

export default function SimpleTextEditor({
  initialContent = "",
  onContentChange,
  placeholder = "Comienza a escribir tu historia...",
}) {
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showStats, setShowStats] = useState(true);

  // ✅ FIX: Actualizar el contenido cuando cambia initialContent
  // Este useEffect se ejecutará cada vez que initialContent cambie
  useEffect(() => {
    console.log("📝 SimpleTextEditor - initialContent cambió:", {
      nuevoContenido: initialContent.substring(0, 50) + "...",
      longitudNueva: initialContent.length,
      longitudActual: content.length,
    });

    // Actualizar el contenido sin condiciones complicadas
    setContent(initialContent);
    updateStats(initialContent);
  }, [initialContent]); // Solo dependemos de initialContent

  // Actualizar estadísticas
  const updateStats = (text) => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleContentChange = (text) => {
    console.log("✏️ Contenido editado - nueva longitud:", text.length);
    setContent(text);
    updateStats(text);

    if (onContentChange) {
      onContentChange(text);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de herramientas */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowStats(!showStats)}
        >
          <Text style={styles.toolButtonText}>📊 Estadísticas</Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      {showStats && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            Palabras: {wordCount} | Caracteres: {charCount}
          </Text>
        </View>
      )}

      {/* Editor */}
      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={handleContentChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  toolbar: {
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  toolButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  toolButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statsBar: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
  },
  statsText: {
    fontSize: 12,
    color: "#2E7D32",
    textAlign: "center",
  },
  editorContainer: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    padding: 20,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "serif",
    minHeight: 500,
    color: "#333",
  },
});
