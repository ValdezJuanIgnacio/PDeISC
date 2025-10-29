import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";

/**
 * Componente FilterBar - Barra de filtros reutilizable
 *
 * Props:
 * - items: Array de strings con los elementos a filtrar
 * - selectedItem: String con el item seleccionado actualmente
 * - onSelectItem: Función que se ejecuta al seleccionar un item
 * - title: Título de la sección de filtros (opcional)
 * - showTitle: Boolean para mostrar/ocultar el título (default: true)
 */
export default function FilterBar({
  items = [],
  selectedItem = "",
  onSelectItem = () => {},
  title = "Filtrar",
  showTitle = true,
  horizontal = true,
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = (item) => {
    // Animación al presionar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSelectItem(item);
  };

  const renderFilterChip = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.filterChip,
        selectedItem === item && styles.filterChipActive,
      ]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedItem === item && styles.filterChipTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.title}>{title}</Text>}

      {horizontal ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map(renderFilterChip)}
        </ScrollView>
      ) : (
        <View style={styles.gridContainer}>{items.map(renderFilterChip)}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  filterChip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterChipActive: {
    backgroundColor: "#B87D5F",
    elevation: 3,
    shadowOpacity: 0.2,
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
});
