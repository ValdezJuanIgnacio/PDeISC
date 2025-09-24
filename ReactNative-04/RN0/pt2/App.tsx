import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
  View,
  Image,
  Button,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Lista de componentes para mostrar
const componentes = [
  {id: '1', nombre: 'View', descripcion: 'Contenedor básico para la organización del layout.'},
  {id: '2', nombre: 'Text', descripcion: 'Muestra texto en la pantalla.'},
  {id: '3', nombre: 'Image', descripcion: 'Muestra imágenes desde archivos locales o URL.'},
  {id: '4', nombre: 'Button', descripcion: 'Un botón simple para acciones. Limitado en estilos.'},
  {id: '5', nombre: 'TouchableOpacity', descripcion: 'Contenedor que hace que su contenido sea sensible al toque. Ideal para botones con más estilo.'},
  {id: '6', nombre: 'TextInput', descripcion: 'Campo para que el usuario ingrese texto.'},
  {id: '7', nombre: 'ScrollView', descripcion: 'Contenedor para contenido que se puede desplazar (scroll).'},
  {id: '8', nombre: 'FlatList', descripcion: 'Lista eficiente para mostrar grandes cantidades de datos.'},
  {id: '9', nombre: 'SafeAreaView', descripcion: 'Asegura que el contenido no se solape con las áreas de seguridad de la pantalla.'},
];

const App = () => {

  const renderItem = ({ item }) => {
    let ejemploComponente;

    // Se renderiza el componente de ejemplo según el nombre
    switch (item.nombre) {
      case 'View':
        ejemploComponente = <View style={styles.ejemploView} />;
        break;
      case 'Text':
        ejemploComponente = <Text style={styles.ejemploText}>Hola Mundo!</Text>;
        break;
      case 'Image':
        ejemploComponente = (
          <Image
            style={styles.ejemploImage}
            source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          />
        );
        break;
      case 'Button':
        ejemploComponente = <Button title="Presionar" onPress={() => {}} />;
        break;
      case 'TouchableOpacity':
        ejemploComponente = (
          <TouchableOpacity style={styles.ejemploTouchable} onPress={() => {}}>
            <Text style={styles.ejemploTouchableText}>Toque Aquí</Text>
          </TouchableOpacity>
        );
        break;
      case 'TextInput':
        ejemploComponente = <TextInput style={styles.ejemploTextInput} placeholder="Escribe aquí..." />;
        break;
      case 'ScrollView':
        ejemploComponente = (
          <ScrollView horizontal style={styles.ejemploScrollView}>
            <View style={styles.cuadradoScroll} />
            <View style={styles.cuadradoScroll} />
          </ScrollView>
        );
        break;
      case 'FlatList':
        ejemploComponente = <Text style={styles.ejemploPlaceholder}>Verás la lista en la pantalla principal.</Text>
        break;
      case 'SafeAreaView':
        ejemploComponente = <Text style={styles.ejemploPlaceholder}>La aplicación ya está dentro de una `SafeAreaView`.</Text>
        break;
      default:
        ejemploComponente = null;
    }

    return (
      <View style={styles.itemContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
        </View>
        <View style={styles.ejemploContenedor}>
          {ejemploComponente}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={componentes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Componentes Nativos de React Native</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  header: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    marginBottom: 10,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ejemploContenedor: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilos de ejemplo para los componentes
  ejemploView: {
    width: 80,
    height: 40,
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },
  ejemploText: {
    fontSize: 16,
    color: '#000',
  },
  ejemploImage: {
    width: 60,
    height: 60,
  },
  ejemploTouchable: {
    backgroundColor: '#03dac6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  ejemploTouchableText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ejemploTextInput: {
    width: '90%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  ejemploScrollView: {
    flexDirection: 'row',
  },
  cuadradoScroll: {
    width: 60,
    height: 60,
    backgroundColor: '#3700b3',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  ejemploPlaceholder: {
    color: '#999',
    fontStyle: 'italic',
  }
});

export default App;