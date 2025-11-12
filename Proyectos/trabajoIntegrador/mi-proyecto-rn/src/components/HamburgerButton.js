import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Importar el icono personalizado
import { MenuIcon } from "./CustomIcons";

/**
 * Botón Hamburguesa para abrir el Drawer
 *
 * Uso:
 * import HamburgerButton from '../components/HamburgerButton';
 *
 * <HamburgerButton />
 */
export default function HamburgerButton({ style, size = 28, color = "#FFF" }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.openDrawer();
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <MenuIcon size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
