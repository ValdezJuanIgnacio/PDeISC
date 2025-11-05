import React, { useContext } from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/AuthContext";

// Importar pantallas
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LibraryScreen from "../screens/LibraryScreen";
import BookDetailScreen from "../screens/BookDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import WriteScreen from "../screens/WriteScreen";
import LibrarianReportsScreen from "../screens/LibrarianReportsScreen";
import AdminReportsScreen from "../screens/AdminReportsScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";
import AdminUsersDetailScreen from "../screens/AdminUsersDetailScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// STACKS REUTILIZABLES
// ==========================================

// Stack para usuarios no autenticados
function GuestStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Stack para explorar
function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack para reportes de bibliotecario
function LibrarianReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="LibrarianReportsList"
        component={LibrarianReportsScreen}
      />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack para reportes de admin
function AdminReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminReportsList" component={AdminReportsScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack para usuarios del admin
function AdminUsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminUsersList" component={AdminUsersScreen} />
      <Stack.Screen
        name="AdminUsersDetail"
        component={AdminUsersDetailScreen}
      />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack para escribir
function WriteStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WriteMain" component={WriteScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack para perfil
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}

// ==========================================
// TABS PARA DIFERENTES ROLES
// ==========================================

// Tabs para usuarios normales
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#B87D5F",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarLabel: "Explorar",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Write"
        component={WriteStack}
        options={{
          tabBarLabel: "Escribir",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>✍️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Tabs para bibliotecarios
function LibrarianTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#B87D5F",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarLabel: "Explorar",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={LibrarianReportsStack}
        options={{
          tabBarLabel: "Reportes",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>⚠️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Write"
        component={WriteStack}
        options={{
          tabBarLabel: "Escribir",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>✍️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ✅ NUEVO: Tabs para administradores
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#B87D5F",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarLabel: "Explorar",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUsersStack}
        options={{
          tabBarLabel: "Usuarios",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AdminReports"
        component={AdminReportsStack}
        options={{
          tabBarLabel: "Reportes",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🛡️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ==========================================
// NAVEGADOR PRINCIPAL
// ==========================================

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <GuestStack />
      ) : user.role === "admin" ? (
        <AdminTabs />
      ) : user.is_librarian ? (
        <LibrarianTabs />
      ) : (
        <UserTabs />
      )}
    </NavigationContainer>
  );
}
