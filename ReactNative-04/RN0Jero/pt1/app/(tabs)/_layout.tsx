import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // No necesitamos header separado
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#777',
        tabBarStyle: {
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 30, // altura desde arriba
          width: width * 1, // 80% de la pantalla
          flexDirection: 'row',
          justifyContent: 'space-around',
          backgroundColor: 'rgba(255,255,255,0.3)', // fondo semi-transparente
          borderBottomWidth: 5,
          borderTopColor: 'transparent',
          borderBottomColor: '#ccc',
          borderRadius: 100,
          paddingVertical: 10,
          elevation: 10, // sombra android
          shadowColor: '#000', // sombra ios
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="build" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nuevo"
        options={{
          title: 'Nuevo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}