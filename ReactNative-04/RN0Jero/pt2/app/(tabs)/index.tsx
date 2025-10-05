// App.tsx
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

const IMAGE_URL = 'https://elcomercio.pe/resizer/v2/6Y2EDIISGFGVFANEVDCR5LCG34.jpg?auth=f58b5c647a09717054d85bb8b9a6bc624bfcb14fe9c60b5246730ea6a513e2b0&width=1198&height=690&quality=75&smart=true'; // Cambia aquí tu URL

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [isSuperSaiyan, setIsSuperSaiyan] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const toggleSwitch = () => setIsSuperSaiyan(prev => !prev);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.scrollContainer}
          >
            <Text style={styles.title}>Dragon Ball</Text>
            <Text style={styles.subtitle}>componentes</Text>

            {/* View */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>View</Text>
              <View style={styles.viewExample}>
                <Text style={styles.whiteText}>Esto es como picoro</Text>
              </View>
            </View>

            {/* TextInput */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>TextInput</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu nombre."
                placeholderTextColor="#aaa"
                value={inputValue}
                onChangeText={setInputValue}
              />
              <Text style={styles.whiteText}>texto que escribiste: {inputValue || 'menos de 9000'}</Text>
            </View>

            {/* Image */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Image</Text>
              <Image source={{ uri: IMAGE_URL }} style={styles.image} />
              <Text style={styles.whiteText}>Goku es crack</Text>
            </View>

            {/* Switch */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Super Saiyan</Text>
              <Switch value={isSuperSaiyan} onValueChange={toggleSwitch} />
              <Text style={styles.whiteText}>
                Estás en: {isSuperSaiyan ? 'super Saiyajin ' : 'base'}
              </Text>
            </View>

            {/* Pressable */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pressable</Text>
              <Pressable
                onPress={() => Alert.alert('kameee')}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: pressed ? '#ff9900' : '#f57c00' },
                ]}
              >
                <Text style={styles.buttonText}>Lanzar Kamehameha</Text>
              </Pressable>
            </View>

            {/* TouchableOpacity */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>TouchableOpacity</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Fusiooon')}
                style={styles.touchableButton}
              >
                <Text style={styles.buttonText}>Fusionar</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Trigger */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Modal Shenlong</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={[styles.touchableButton, { backgroundColor: '#009688' }]}
              >
                <Text style={styles.buttonText}>Invocar a Shenlong</Text>
              </TouchableOpacity>
            </View>

            {/* FlatList */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>FlatList ataques</Text>
              <FlatList
                data={[
                  { key: 'Kamehameha' },
                  { key: 'Genkidama' },
                  { key: 'Kaioken' },
                  { key: 'Resplandor final' },
                ]}
                renderItem={({ item }) => (
                  <Text style={styles.whiteText}>• {item.key}</Text>
                )}
                scrollEnabled={false}
              />
            </View>

            {/* ActivityIndicator */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ActivityIndicator</Text>
              <ActivityIndicator size="large" color="#00e5ff" />
            </View>
          </ScrollView>

          {/* Shenlong Modal */}
          <Modal
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>reuniste las 7 esferas del dragón, sos crack</Text>
                  <Text style={styles.whiteText}>pedite un deseo</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Deseo concedido');
                      setModalVisible(false);
                    }}
                    style={styles.closeButton}
                  >
                    <Text style={styles.buttonText}>volver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1c40f',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 100,
    marginBottom: 20,
    borderColor: '#2c3e50',
    borderWidth: 1,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00e5ff',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#222',
    color: 'white',
    padding: 12,
    borderRadius: 100,
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
  },
  whiteText: {
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginTop: 10,
    borderRadius: 100,
  },
  viewExample: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 100,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  touchableButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 100,
    alignItems: 'center',
    width: '100%',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1b1b1b',
    borderRadius: 100,
    padding: 25,
    alignItems: 'center',
    borderColor: '#f1c40f',
    borderWidth: 2,
  },
  modalText: {
    fontSize: 20,
    color: '#00ff00',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 100,
    marginTop: 15,
    width: '60%',
    alignItems: 'center',
  },
});
