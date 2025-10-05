import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { userName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Iniciar Sesión" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Registrarse" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Bienvenido",
            headerLeft: () => null, // Evita volver atrás
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
