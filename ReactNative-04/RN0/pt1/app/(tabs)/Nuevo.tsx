import { View, Text, StyleSheet } from "react-native";

export default function NuevoTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nuevo Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
  },
  text: {
    fontSize: 22,
    color: "#00796b",
  },
});
