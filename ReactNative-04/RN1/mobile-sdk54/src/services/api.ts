import axios from "axios";

// IMPORTANTE: Reemplaza esta IP con la IP real de tu computadora
// Para obtenerla ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux)
// Busca "Dirección IPv4" o "inet"

// Si usas el emulador de Android, usa esta:
// const API_URL = "http://10.0.2.2:3000/api";

// Si usas un dispositivo físico o iOS simulator, usa tu IP local:
const API_URL = "http://192.168.100.66:3000/api";

// Configurar timeout más largo para debugging
axios.defaults.timeout = 10000; // 10 segundos

export interface LoginData {
  name: string;
  password: string;
}

export interface RegisterData {
  name: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
  };
}

export const login = async (data: LoginData): Promise<ApiResponse> => {
  try {
    console.log('Intentando login a:', `${API_URL}/login`);
    const response = await axios.post(`${API_URL}/login`, data);
    console.log('Respuesta login:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error en login:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      return error.response.data;
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      throw new Error(
        "No se pudo conectar con el servidor. Verifica que:\n" +
        "1. El servidor backend esté corriendo (node server.js)\n" +
        "2. La IP sea correcta: " + API_URL + "\n" +
        "3. Tu dispositivo esté en la misma red WiFi\n" +
        "4. El firewall no esté bloqueando el puerto 3000"
      );
    } else {
      // Algo pasó al configurar la petición
      throw new Error("Error al realizar la petición: " + error.message);
    }
  }
};

export const register = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    console.log('Intentando registro a:', `${API_URL}/register`);
    const response = await axios.post(`${API_URL}/register`, data);
    console.log('Respuesta registro:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    if (error.response) {
      return error.response.data;
    } else if (error.request) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica que:\n" +
        "1. El servidor backend esté corriendo (node server.js)\n" +
        "2. La IP sea correcta: " + API_URL + "\n" +
        "3. Tu dispositivo esté en la misma red WiFi\n" +
        "4. El firewall no esté bloqueando el puerto 3000"
      );
    } else {
      throw new Error("Error al realizar la petición: " + error.message);
    }
  }
};

// Función de prueba para verificar conectividad
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(API_URL.replace('/api', '/health'), {
      timeout: 5000
    });
    console.log('Test de conexión exitoso:', response.data);
    return true;
  } catch (error) {
    console.error('Test de conexión falló:', error);
    return false;
  }
};