import { Platform, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.background}>
      <Text style={styles.titulo}>Hola Estanga</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 50,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: 'gray',
    textAlign: 'center',
    marginTop: Platform.OS === 'ios' ? 70 : 30,
    borderColor: 'white',
    borderWidth: 5, // sin 'px'
    padding: 30,
    borderRadius: 100,
    // Sombra iOS
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    // Sombra Android
    elevation: 10,  
    backgroundColor: 'white',
  },
  background: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
});