import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Header({
  title,
  subtitle,
  onEditPress,
  showEdit = false,
  showMenu = true,
}) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showMenu && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.toggleDrawer()}
        >
          <View style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {showEdit && (
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      )}

      {!showEdit && showMenu && <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  hamburger: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  hamburgerLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#B87D5F",
    borderRadius: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "serif",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    fontSize: 20,
    color: "#B87D5F",
  },
  spacer: {
    width: 40,
  },
});
