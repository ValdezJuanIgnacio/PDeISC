import React, { useState } from "react";
import { FlatList, View, Text, Button } from "react-native";
import ComponenteGuia from "./ComponenteGuia";
import { styles } from "../styles/styles";

type ItemData = { id: string; title: string };

const FlatListDemo = () => {
  const [items, setItems] = useState<ItemData[]>([
    { id: "1", title: "Elemento 1: Compras" },
    { id: "2", title: "Elemento 2: Tareas" },
  ]);

  // Agregar nuevo elemento
  const addItem = () => {
    const newItem: ItemData = {
      id: (items.length + 1).toString(),
      title: `Elemento ${items.length + 1}`,
    };
    setItems([...items, newItem]);
  };

  // Eliminar un elemento por ID
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <ComponenteGuia
      title="9. FlatList"
      explanation="Sirve para renderizar listas grandes de datos."
    >
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.flatListItem}>
            <Text style={styles.flatListText}>{item.title}</Text>
            <Button
              title="Eliminar"
              color="#dc2626"
              onPress={() => removeItem(item.id)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.flatListDemo}
        scrollEnabled={false}
      />

      <Button title="Agregar elemento" onPress={addItem} color="#2563eb" />
    </ComponenteGuia>
  );
};

export default FlatListDemo;
