import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  Button,
  Image,
  ActivityIndicator,
  Switch,
  Pressable,
  StatusBar,
  Platform,
} from "react-native";

import ComponenteGuia from "./components/ComponenteGuia";
import FlatListDemo from "./components/FlatListDemo";
import ModalDemo from "./components/ModalDemo";
import { styles } from "./styles/styles";

const App = () => {
  // Estados globales
  const [textInputValue, setTextInputValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const imageUrl = "https://placehold.co/100x100/38bdf8/ffffff?text=RN+Icono";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          Guía de Componentes Nativos de React Native
        </Text>

        {/* =================== View =================== */}
        <ComponenteGuia
          title="1. View"
          explanation="El contenedor más básico, similar a un <div>."
        >
          <View style={styles.viewDemo}>
            <Text style={{ color: "white" }}>Contenedor View</Text>
          </View>
        </ComponenteGuia>

        {/* =================== Text =================== */}
        <ComponenteGuia
          title="2. Text"
          explanation="El único componente para mostrar texto."
        >
          <Text style={styles.textDemo}>¡Guía de Componentes!</Text>
        </ComponenteGuia>

        {/* =================== TextInput =================== */}
        <ComponenteGuia
          title="3. TextInput"
          explanation="Permite al usuario ingresar texto."
        >
          <TextInput
            style={styles.textInputDemo}
            onChangeText={setTextInputValue}
            value={textInputValue}
            placeholder="Escribe algo aquí..."
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.sectionExplanation}>
            Valor actual: {textInputValue}
          </Text>
        </ComponenteGuia>

        {/* =================== Button =================== */}
        <ComponenteGuia
          title="4. Button"
          explanation="Botón simple adaptado al estilo nativo."
        >
          <Button
            title="Botón Simple"
            onPress={() => alert("¡Botón presionado!")}
            color="#1d4ed8"
          />
        </ComponenteGuia>

        {/* =================== Pressable =================== */}
        <ComponenteGuia
          title="5. Pressable"
          explanation="Más versátil para interacciones personalizadas."
        >
          <Pressable
            onPress={() => alert("¡Pressable tocado!")}
            style={({ pressed }) => [
              styles.pressableDemo,
              { backgroundColor: pressed ? "#059669" : "#10b981" },
            ]}
          >
            <Text style={styles.pressableText}>Pressable Personalizado</Text>
          </Pressable>
        </ComponenteGuia>

        {/* =================== Image =================== */}
        <ComponenteGuia
          title="6. Image"
          explanation="Muestra imágenes remotas o locales."
        >
          <Image source={{ uri: imageUrl }} style={styles.imageDemo} />
        </ComponenteGuia>

        {/* =================== ActivityIndicator =================== */}
        <ComponenteGuia
          title="7. ActivityIndicator"
          explanation="Indicador de carga (spinner)."
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#f97316" />
            <Button
              title={isLoading ? "Cargando..." : "Simular Carga"}
              onPress={() => setIsLoading(!isLoading)}
              color="#f97316"
            />
          </View>
        </ComponenteGuia>

        {/* =================== Switch =================== */}
        <ComponenteGuia
          title="8. Switch"
          explanation="Interruptor booleano (on/off)."
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ marginRight: 10 }}>
              {switchValue ? "Encendido" : "Apagado"}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#6ee7b7" }}
              thumbColor={switchValue ? "#10b981" : "#f4f3f4"}
              onValueChange={setSwitchValue}
              value={switchValue}
            />
          </View>
        </ComponenteGuia>

        {/* =================== Modal =================== */}
        <ModalDemo />

        {/* =================== FlatList =================== */}
        <FlatListDemo />

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
