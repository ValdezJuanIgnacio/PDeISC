import axios from "axios";

// Cambia esta URL por la IP de tu computadora si usas un dispositivo físico
// Ejemplo: http://192.168.1.10:3000
const API_URL = "http://192.168.100.86:3000/api";

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
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error("Error de conexión con el servidor");
  }
};

export const register = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error("Error de conexión con el servidor");
  }
};
