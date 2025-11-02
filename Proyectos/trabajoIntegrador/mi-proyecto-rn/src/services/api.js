import axios from "axios";
import { getToken } from "../utils/storage";

// Configuración de la URL base
const getApiUrl = () => {
  if (__DEV__) {
    // IMPORTANTE: Cambia esto por tu IP local
    return "http://192.168.100.86:3000/api";
  }
  return "https://tu-dominio.com/api";
};

const API_URL = getApiUrl();

console.log("🌐 API URL configurada:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para agregar token y logging
api.interceptors.request.use(
  async (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    console.log("📦 Request data:", config.data);

    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔒 Token added to request");
      } else {
        console.log("⚠️ No token available");
      }
    } catch (error) {
      console.error("❌ Error getting token:", error);
    }

    return config;
  },
  (error) => {
    console.error("💥 Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method.toUpperCase()} ${
        response.config.url
      } - Status: ${response.status}`
    );
    console.log("📥 Response data:", response.data);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error("❌ API Error Response:");
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
      console.error("   URL:", error.config?.url);

      if (error.response.status === 401) {
        console.log("🔒 Unauthorized - Token might be invalid");
      }
    } else if (error.request) {
      console.error("❌ API No Response:");
      console.error("   Request:", error.request);
      console.error("   Message:", error.message);

      error.message =
        "No se pudo conectar con el servidor. Verifica tu conexión y que el servidor esté corriendo.";
    } else {
      console.error("❌ API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: (data) => {
    console.log("🔵 authAPI.register called with:", data);
    return api.post("/auth/register", data);
  },
  login: (data) => {
    console.log("🔵 authAPI.login called with:", { email: data.email });
    return api.post("/auth/login", data);
  },
  googleAuth: (data) => {
    console.log("🔵 authAPI.googleAuth called");
    return api.post("/auth/google", data);
  },
};

// ==================== BOOKS API ====================
export const booksAPI = {
  getAll: () => {
    console.log("🔵 booksAPI.getAll called");
    return api.get("/books");
  },

  getPublished: () => {
    console.log("🔵 booksAPI.getPublished called");
    return api.get("/books/published");
  },

  getById: (id) => {
    console.log("🔵 booksAPI.getById called with id:", id);
    return api.get(`/books/${id}`);
  },

  getMyBooks: () => {
    console.log("🔵 booksAPI.getMyBooks called");
    return api.get("/books/my-books");
  },

  create: (data) => {
    console.log("🔵 booksAPI.create called");
    return api.post("/books", data);
  },

  update: (id, data) => {
    console.log("🔵 booksAPI.update called with id:", id);
    return api.put(`/books/${id}`, data);
  },

  delete: (id) => {
    console.log("🔵 booksAPI.delete called with id:", id);
    return api.delete(`/books/${id}`);
  },

  submit: (id) => {
    console.log("🔵 booksAPI.submit called with id:", id);
    return api.post(`/books/${id}/submit`);
  },

  publish: async (id) => {
    console.log("🔵 booksAPI.publish called with id:", id);
    try {
      const response = await api.post(`/books/${id}/publish`);
      if (response.data && response.data.success === false) {
        console.error(
          "❌ booksAPI.publish - backend responded with success:false",
          response.data
        );
        const err = new Error(response.data.message || "Error en publicación");
        err.response = { data: response.data, status: response.status };
        throw err;
      }

      console.log("✅ Libro publicado exitosamente:", response.data);
      return response;
    } catch (error) {
      console.error(
        "❌ Error en booksAPI.publish:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  downloadPDF: (id) => {
    console.log("🔵 booksAPI.downloadPDF called with id:", id);
    return api.get(`/books/${id}/download-pdf`);
  },

  // NUEVO - Registrar visualización de un libro
  registerView: (id) => {
    console.log("🔵 booksAPI.registerView called with id:", id);
    return api.post(`/books/${id}/view`);
  },

  // NUEVO - Obtener estadísticas de visualizaciones
  getViewStats: (id) => {
    console.log("🔵 booksAPI.getViewStats called with id:", id);
    return api.get(`/books/${id}/views`);
  },
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryOperation = async (operation, retries = MAX_RETRIES) => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      console.log(`🔄 Reintentando operación. Intentos restantes: ${retries}`);
      await delay(RETRY_DELAY);
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

// ==================== CHAPTERS API ====================
export const chaptersAPI = {
  getByBookId: (bookId) => {
    console.log("🔵 chaptersAPI.getByBookId called with bookId:", bookId);
    if (!bookId) {
      throw new Error("Se requiere el ID del libro");
    }
    return retryOperation(() => api.get(`/chapters/book/${bookId}`));
  },
  create: async (data) => {
    console.log("🔵 chaptersAPI.create called with data:", data);
    if (!data.title || !data.content || !data.book_id) {
      throw new Error("Faltan campos requeridos para crear el capítulo");
    }
    return retryOperation(() => api.post("/chapters", data));
  },
  update: async (id, data) => {
    console.log("🔵 chaptersAPI.update called with id:", id, "and data:", data);
    if (!id || !data.title || !data.content) {
      throw new Error("Faltan campos requeridos para actualizar el capítulo");
    }
    return retryOperation(() => api.put(`/chapters/${id}`, data));
  },
  delete: async (id) => {
    console.log("🔵 chaptersAPI.delete called with id:", id);
    if (!id) {
      throw new Error("Se requiere el ID del capítulo para eliminarlo");
    }
    return retryOperation(() => api.delete(`/chapters/${id}`));
  },
};

// ==================== INTERACTIONS API ====================
export const interactionsAPI = {
  getUserInteractions: (bookId) => {
    console.log(
      "🔵 interactionsAPI.getUserInteractions called with bookId:",
      bookId
    );
    return api.get(`/interactions/book/${bookId}`);
  },

  addLike: (bookId) => {
    console.log("🔵 interactionsAPI.addLike called with bookId:", bookId);
    return api.post(`/interactions/like`, { book_id: bookId });
  },

  removeLike: (bookId) => {
    console.log("🔵 interactionsAPI.removeLike called with bookId:", bookId);
    return api.delete(`/interactions/like/${bookId}`);
  },

  addDislike: (bookId) => {
    console.log("🔵 interactionsAPI.addDislike called with bookId:", bookId);
    return api.post(`/interactions/dislike`, { book_id: bookId });
  },

  removeDislike: (bookId) => {
    console.log("🔵 interactionsAPI.removeDislike called with bookId:", bookId);
    return api.delete(`/interactions/dislike/${bookId}`);
  },

  markAsRead: (bookId) => {
    console.log("🔵 interactionsAPI.markAsRead called with bookId:", bookId);
    return api.post(`/interactions/read`, { book_id: bookId });
  },

  unmarkAsRead: (bookId) => {
    console.log("🔵 interactionsAPI.unmarkAsRead called with bookId:", bookId);
    return api.delete(`/interactions/read/${bookId}`);
  },

  getBookStats: (bookId) => {
    console.log("🔵 interactionsAPI.getBookStats called with bookId:", bookId);
    return api.get(`/interactions/stats/${bookId}`);
  },
};

// ==================== COMMENTS API ====================
export const commentsAPI = {
  getBookComments: (bookId) => {
    console.log("🔵 commentsAPI.getBookComments called with bookId:", bookId);
    return api.get(`/comments/book/${bookId}`);
  },

  getChapterComments: (chapterId) => {
    console.log(
      "🔵 commentsAPI.getChapterComments called with chapterId:",
      chapterId
    );
    return api.get(`/comments/chapter/${chapterId}`);
  },

  create: (commentData) => {
    console.log("🔵 commentsAPI.create called");
    return api.post(`/comments`, commentData);
  },

  update: (id, commentData) => {
    console.log("🔵 commentsAPI.update called with id:", id);
    return api.put(`/comments/${id}`, commentData);
  },

  delete: (id) => {
    console.log("🔵 commentsAPI.delete called with id:", id);
    return api.delete(`/comments/${id}`);
  },

  reply: (commentId, replyData) => {
    console.log("🔵 commentsAPI.reply called with commentId:", commentId);
    return api.post(`/comments/${commentId}/reply`, replyData);
  },

  getReplies: (commentId) => {
    console.log("🔵 commentsAPI.getReplies called with commentId:", commentId);
    return api.get(`/comments/${commentId}/replies`);
  },
};

// Función de utilidad para verificar la conexión
export const checkConnection = async () => {
  try {
    console.log("🔍 Checking server connection...");
    const response = await api.get("/health");
    console.log("✅ Server is reachable:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Server connection failed:", error.message);
    throw new Error("No se pudo conectar con el servidor");
  }
};

export default api;
