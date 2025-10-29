import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";

export default function RichTextEditor({
  initialContent = "",
  onContentChange,
  placeholder = "Comienza a escribir tu historia...",
}) {
  const richText = useRef();
  const [showStats, setShowStats] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleContentChange = (html) => {
    setContent(html);

    // Calcular estadísticas
    const text = html.replace(/<[^>]*>/g, "").trim();
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);

    if (onContentChange) {
      onContentChange(html);
    }
  };

  const insertHeading = () => {
    richText.current?.insertHTML("<h2>Título del Capítulo</h2>");
  };

  const insertDivider = () => {
    richText.current?.insertHTML("<hr/>");
  };

  return (
    <View style={styles.container}>
      {/* Barra de herramientas personalizada */}
      <View style={styles.customToolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.toolButton} onPress={insertHeading}>
            <Text style={styles.toolButtonText}>H2</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton} onPress={insertDivider}>
            <Text style={styles.toolButtonText}>---</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => setShowStats(!showStats)}
          >
            <Text style={styles.toolButtonText}>📊</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Estadísticas */}
      {showStats && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            Palabras: {wordCount} | Caracteres: {charCount}
          </Text>
        </View>
      )}

      {/* Barra de herramientas principal */}
      <RichToolbar
        editor={richText}
        actions={[
          actions.undo,
          actions.redo,
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.blockquote,
          actions.removeFormat,
        ]}
        iconMap={{
          [actions.undo]: () => <Text style={styles.iconText}>↶</Text>,
          [actions.redo]: () => <Text style={styles.iconText}>↷</Text>,
          [actions.setBold]: () => <Text style={styles.iconText}>B</Text>,
          [actions.setItalic]: () => <Text style={styles.iconText}>I</Text>,
          [actions.setUnderline]: () => <Text style={styles.iconText}>U</Text>,
        }}
        style={styles.richToolbar}
        selectedIconTint="#B87D5F"
        disabledIconTint="#bfbfbf"
      />

      {/* Editor */}
      <ScrollView style={styles.editorContainer}>
        <RichEditor
          ref={richText}
          onChange={handleContentChange}
          placeholder={placeholder}
          initialContentHTML={initialContent}
          style={styles.richEditor}
          editorStyle={{
            backgroundColor: "#fff",
            color: "#333",
            placeholderColor: "#999",
            contentCSSText: `
              font-family: 'Georgia', serif;
              font-size: 18px;
              line-height: 1.8;
              padding: 20px;
              min-height: 500px;
            `,
          }}
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
  customToolbar: {
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  toolButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 5,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
  richToolbar: {
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editorContainer: {
    flex: 1,
  },
  richEditor: {
    flex: 1,
    minHeight: 500,
  },
});
