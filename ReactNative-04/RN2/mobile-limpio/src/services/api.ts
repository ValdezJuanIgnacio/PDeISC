import axios from "axios";

// ⚠️ IMPORTANTE: Cambia esta IP por la tuya
// Para obtenerla: ipconfig (Windows) o ifconfig (Mac/Linux)
// Busca "Dirección IPv4" o "inet"
const API_URL = "http://192.168.100.86:3000/api"; // ← CAMBIAR POR TU IP

axios.defaults.timeout = 10000;

export interface LoginData {
  name: string;
  password: string;
}

export interface RegisterData {
  name: string;
  password: string;
  email?: string;
}

export interface OAuthLoginData {
  provider: "google" | "facebook" | "apple";
  providerId: string;
  email: string;
  name: string;
  profilePhoto?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  profilePhoto?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  dateOfBirth?: string;
  authProvider: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  dateOfBirth?: string;
}

// Login tradicional
export const login = async (data: LoginData): Promise<ApiResponse> => {
  try {
    console.log("Intentando login a:", `${API_URL}/login`);
    const response = await axios.post(`${API_URL}/login`, data);
    console.log("Respuesta login:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error en login:", error);
    return handleError(error);
  }
};

// Registro tradicional
export const register = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    console.log("Intentando registro a:", `${API_URL}/register`);
    const response = await axios.post(`${API_URL}/register`, data);
    console.log("Respuesta registro:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error en registro:", error);
    return handleError(error);
  }
};

// Login con OAuth
export const oauthLogin = async (
  data: OAuthLoginData
): Promise<ApiResponse> => {
  try {
    console.log("Intentando OAuth login:", data.provider);
    const response = await axios.post(`${API_URL}/oauth-login`, data);
    console.log("Respuesta OAuth:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error en OAuth login:", error);
    return handleError(error);
  }
};

// Obtener perfil de usuario
export const getProfile = async (userId: number): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_URL}/profile/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error obteniendo perfil:", error);
    return handleError(error);
  }
};

// Actualizar perfil
export const updateProfile = async (
  userId: number,
  data: ProfileUpdateData
): Promise<ApiResponse> => {
  try {
    const response = await axios.put(`${API_URL}/profile/${userId}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error actualizando perfil:", error);
    return handleError(error);
  }
};

// Subir foto de perfil
export const uploadProfilePhoto = async (
  userId: number,
  uri: string
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("photo", {
      uri,
      name: filename,
      type,
    } as any);

    const response = await axios.post(
      `${API_URL}/profile/${userId}/photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error subiendo foto:", error);
    return handleError(error);
  }
};

// Subir documento
export const uploadDocument = async (
  userId: number,
  uri: string,
  documentType: string
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "document.pdf";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `application/${match[1]}` : "application/pdf";

    formData.append("document", {
      uri,
      name: filename,
      type,
    } as any);
    formData.append("documentType", documentType);

    const response = await axios.post(
      `${API_URL}/profile/${userId}/document`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error subiendo documento:", error);
    return handleError(error);
  }
};

// Obtener documentos
export const getDocuments = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/profile/${userId}/documents`);
    return response.data;
  } catch (error: any) {
    console.error("Error obteniendo documentos:", error);
    return handleError(error);
  }
};

// Manejo de errores centralizado
const handleError = (error: any): ApiResponse => {
  if (error.response) {
    return error.response.data;
  } else if (error.request) {
    throw new Error(
      "No se pudo conectar con el servidor. Verifica que:\n" +
        "1. El servidor backend esté corriendo\n" +
        "2. La IP sea correcta en api.ts\n" +
        "3. Tu dispositivo esté en la misma red WiFi\n" +
        "4. El firewall no esté bloqueando el puerto 3000"
    );
  } else {
    throw new Error("Error al realizar la petición: " + error.message);
  }
};

// Test de conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(API_URL.replace("/api", "/health"), {
      timeout: 5000,
    });
    console.log("Test de conexión exitoso:", response.data);
    return true;
  } catch (error) {
    console.error("Test de conexión falló:", error);
    return false;
  }
};
