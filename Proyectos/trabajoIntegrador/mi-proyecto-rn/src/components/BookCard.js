import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{
          uri: book.cover_image_url || "https://via.placeholder.com/150x200",
        }}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.writer_name || book.author}
        </Text>
        {book.genre && (
          <View style={styles.genreTag}>
            <Text style={styles.genreText}>{book.genre}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cover: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  author: {
    fontSize: 14,
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
    fontSize: 12,
    color: "#B87D5F",
    fontWeight: "600",
  },
});
