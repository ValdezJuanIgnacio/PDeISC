import axios from "axios";

const API_URL = "http://192.168.100.66:3000/api";

axios.defaults.timeout = 10000;

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
    } else if (error.request) {
      throw new Error("No se pudo conectar con el servidor");
    } else {
      throw new Error("Error: " + error.message);
    }
  }
};

export const register = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    } else if (error.request) {
      throw new Error("No se pudo conectar con el servidor");
    } else {
      throw new Error("Error: " + error.message);
    }
  }
};