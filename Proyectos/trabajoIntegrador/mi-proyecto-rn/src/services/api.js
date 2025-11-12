import axios from "axios";
import { getToken } from "../utils/storage";

// ==========================================
// CONFIGURACIÃ“N DE URL BASE
// ==========================================

const getApiUrl = () => {
  // FORZAR URL DE PRODUCCIÃ“N (Clever Cloud)
  return "https://app-596ffa2e-528f-4ae9-a939-491e67602bd6.cleverapps.io/api";
};

const API_URL = getApiUrl();

console.log("ðŸŒ API URL configurada:", API_URL);

console.log("ðŸŒ API URL configurada:", API_URL);

// ==========================================
// CREAR INSTANCIA DE AXIOS
// ==========================================

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ==========================================
// INTERCEPTOR DE REQUEST
// ==========================================

api.interceptors.request.use(
  async (config) => {
    console.log(`ðŸ“¤ ${config.method.toUpperCase()} ${config.url}`);
    console.log("ðŸ“¦ Request data:", config.data);

    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("ðŸ” Token added to request");
      } else {
        console.log("âš ï¸ No token available");
      }
    } catch (error) {
      console.error("âŒ Error getting token:", error);
    }

    return config;
  },
  (error) => {
    console.error("ðŸ’¥ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ==========================================
// INTERCEPTOR DE RESPONSE
// ==========================================

api.interceptors.response.use(
  (response) => {
    console.log(
      `âœ… ${response.config.method.toUpperCase()} ${
        response.config.url
      } - Status: ${response.status}`
    );
    console.log("ðŸ“¥ Response data:", response.data);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error("âŒ API Error Response:");
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
      console.error("   URL:", error.config?.url);

      if (error.response.status === 401) {
        console.log("ðŸ”’ Unauthorized - Token might be invalid");
      }
    } else if (error.request) {
      console.error("âŒ API No Response:");
      console.error("   Request:", error.request);
      console.error("   Message:", error.message);

      error.message =
        "No se pudo conectar con el servidor. Verifica tu conexiÃ³n y que el servidor estÃ© corriendo.";
    } else {
      console.error("âŒ API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ==========================================
// AUTH API
// ==========================================

export const authAPI = {
  register: (data) => {
    console.log("ðŸ”µ authAPI.register called with:", data);
    return api.post("/auth/register", data);
  },
  login: (data) => {
    console.log("ðŸ”µ authAPI.login called with:", { email: data.email });
    return api.post("/auth/login", data);
  },
  googleAuth: (data) => {
    console.log("ðŸ”µ authAPI.googleAuth called");
    return api.post("/auth/google", data);
  },
  getProfile: () => {
    console.log("ðŸ”µ authAPI.getProfile called");
    return api.get("/auth/profile");
  },
  updateUsername: (username) => {
    console.log("ðŸ”µ authAPI.updateUsername called with:", username);
    return api.put("/auth/profile/username", { username });
  },
  updateProfileImage: (profile_image_url) => {
    console.log("ðŸ”µ authAPI.updateProfileImage called");
    return api.put("/auth/profile/image", { profile_image_url });
  },
  getFavorites: () => {
    console.log("ðŸ”µ authAPI.getFavorites called");
    return api.get("/auth/favorites");
  },
  getReadingHistory: () => {
    console.log("ðŸ”µ authAPI.getReadingHistory called");
    return api.get("/auth/reading-history");
  },
};

// ==========================================
// BOOKS API
// ==========================================

export const booksAPI = {
  getAll: () => {
    console.log("ðŸ”µ booksAPI.getAll called");
    return api.get("/books");
  },

  getPublished: () => {
    console.log("ðŸ”µ booksAPI.getPublished called");
    return api.get("/books/published");
  },

  getById: (id) => {
    console.log("ðŸ”µ booksAPI.getById called with id:", id);
    return api.get(`/books/${id}`);
  },

  getMyBooks: () => {
    console.log("ðŸ”µ booksAPI.getMyBooks called");
    return api.get("/books/my-books");
  },

  create: (data) => {
    console.log("ðŸ”µ booksAPI.create called");
    return api.post("/books", data);
  },

  update: (id, data) => {
    console.log("ðŸ”µ booksAPI.update called with id:", id);
    return api.put(`/books/${id}`, data);
  },

  delete: (id) => {
    console.log("ðŸ”µ booksAPI.delete called with id:", id);
    return api.delete(`/books/${id}`);
  },

  submit: (id) => {
    console.log("ðŸ”µ booksAPI.submit called with id:", id);
    return api.post(`/books/${id}/submit`);
  },

  publish: async (id) => {
    console.log("ðŸ”µ booksAPI.publish called with id:", id);
    try {
      const response = await api.post(`/books/${id}/publish`);
      if (response.data && response.data.success === false) {
        console.error(
          "âŒ booksAPI.publish - backend responded with success:false",
          response.data
        );
        const err = new Error(response.data.message || "Error en publicaciÃ³n");
        err.response = { data: response.data, status: response.status };
        throw err;
      }

      console.log("âœ… Libro publicado exitosamente:", response.data);
      return response;
    } catch (error) {
      console.error(
        "âŒ Error en booksAPI.publish:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  downloadPDF: (id) => {
    console.log("ðŸ”µ booksAPI.downloadPDF called with id:", id);
    return api.get(`/books/${id}/download-pdf`);
  },

  registerView: (id) => {
    console.log("ðŸ”µ booksAPI.registerView called with id:", id);
    return api.post(`/books/${id}/view`);
  },

  getViewStats: (id) => {
    console.log("ðŸ”µ booksAPI.getViewStats called with id:", id);
    return api.get(`/books/${id}/views`);
  },

  downloadChapterPDF: (bookId, chapterId) => {
    console.log(
      "ðŸ”µ booksAPI.downloadChapterPDF called with bookId:",
      bookId,
      "chapterId:",
      chapterId
    );
    return api.get(`/books/${bookId}/chapter/${chapterId}/download-pdf`, {
      responseType: "blob",
    });
  },

  uploadCover: async (imageUri) => {
    console.log("ðŸ”µ booksAPI.uploadCover called with uri:", imageUri);
    try {
      const formData = new FormData();

      const isWeb = typeof window !== "undefined" && !window.navigator.product;

      if (
        isWeb ||
        imageUri.startsWith("blob:") ||
        imageUri.startsWith("data:")
      ) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("cover", blob, "cover.jpg");
      } else {
        const fileExtension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
        const mimeTypes = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };

        formData.append("cover", {
          uri: imageUri,
          type: mimeTypes[fileExtension] || "image/jpeg",
          name: `cover.${fileExtension}`,
        });
      }

      const response = await api.post("/upload/cover", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log("âœ… Cover uploaded successfully:", response.data);
      return response;
    } catch (error) {
      console.error(
        "âŒ Error uploading cover:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

// ==========================================
// CHAPTERS API - Con reintentos
// ==========================================

const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Intento ${i + 1} fallÃ³:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const chaptersAPI = {
  getById: async (id) => {
    console.log("ðŸ”µ chaptersAPI.getById called with id:", id);
    if (!id) {
      throw new Error("Se requiere el ID del capÃ­tulo");
    }
    return retryOperation(() => api.get(`/chapters/${id}`));
  },
  getByBookId: async (bookId) => {
    console.log("ðŸ”µ chaptersAPI.getByBookId called with bookId:", bookId);
    if (!bookId) {
      throw new Error("Se requiere el ID del libro");
    }
    return retryOperation(() => api.get(`/chapters/book/${bookId}`));
  },
  create: async (data) => {
    console.log("ðŸ”µ chaptersAPI.create called with data:", data);
    if (!data.title || !data.content || !data.book_id) {
      throw new Error("Faltan campos requeridos para crear el capÃ­tulo");
    }
    return retryOperation(() => api.post("/chapters", data));
  },
  update: async (id, data) => {
    console.log(
      "ðŸ”µ chaptersAPI.update called with id:",
      id,
      "and data:",
      data
    );
    if (!id || !data.title || !data.content) {
      throw new Error("Faltan campos requeridos para actualizar el capÃ­tulo");
    }
    return retryOperation(() => api.put(`/chapters/${id}`, data));
  },
  delete: async (id) => {
    console.log("ðŸ”µ chaptersAPI.delete called with id:", id);
    if (!id) {
      throw new Error("Se requiere el ID del capÃ­tulo para eliminarlo");
    }
    return retryOperation(() => api.delete(`/chapters/${id}`));
  },
};

// ==========================================
// INTERACTIONS API
// ==========================================

export const interactionsAPI = {
  getUserInteractions: (bookId) => {
    console.log(
      "ðŸ”µ interactionsAPI.getUserInteractions called with bookId:",
      bookId
    );
    return api.get(`/interactions/book/${bookId}`);
  },

  addLike: (bookId) => {
    console.log("ðŸ”µ interactionsAPI.addLike called with bookId:", bookId);
    return api.post(`/interactions/like`, { book_id: bookId });
  },

  removeLike: (bookId) => {
    console.log("ðŸ”µ interactionsAPI.removeLike called with bookId:", bookId);
    return api.delete(`/interactions/like/${bookId}`);
  },

  addDislike: (bookId) => {
    console.log("ðŸ”µ interactionsAPI.addDislike called with bookId:", bookId);
    return api.post(`/interactions/dislike`, { book_id: bookId });
  },

  removeDislike: (bookId) => {
    console.log(
      "ðŸ”µ interactionsAPI.removeDislike called with bookId:",
      bookId
    );
    return api.delete(`/interactions/dislike/${bookId}`);
  },

  markAsRead: (bookId) => {
    console.log("ðŸ”µ interactionsAPI.markAsRead called with bookId:", bookId);
    return api.post(`/interactions/read`, { book_id: bookId });
  },

  unmarkAsRead: (bookId) => {
    console.log(
      "ðŸ”µ interactionsAPI.unmarkAsRead called with bookId:",
      bookId
    );
    return api.delete(`/interactions/read/${bookId}`);
  },

  getBookStats: (bookId) => {
    console.log(
      "ðŸ”µ interactionsAPI.getBookStats called with bookId:",
      bookId
    );
    return api.get(`/interactions/stats/${bookId}`);
  },
};

// ==========================================
// COMMENTS API
// ==========================================

export const commentsAPI = {
  getBookComments: (bookId) => {
    console.log("ðŸ”µ commentsAPI.getBookComments called with bookId:", bookId);
    return api.get(`/comments/book/${bookId}`);
  },

  getChapterComments: (chapterId) => {
    console.log(
      "ðŸ”µ commentsAPI.getChapterComments called with chapterId:",
      chapterId
    );
    return api.get(`/comments/chapter/${chapterId}`);
  },

  create: (commentData) => {
    console.log("ðŸ”µ commentsAPI.create called");
    return api.post(`/comments`, commentData);
  },

  update: (id, commentData) => {
    console.log("ðŸ”µ commentsAPI.update called with id:", id);
    return api.put(`/comments/${id}`, commentData);
  },

  delete: (id) => {
    console.log("ðŸ”µ commentsAPI.delete called with id:", id);
    return api.delete(`/comments/${id}`);
  },

  reply: (commentId, replyData) => {
    console.log("ðŸ”µ commentsAPI.reply called with commentId:", commentId);
    return api.post(`/comments/${commentId}/reply`, replyData);
  },

  getReplies: (commentId) => {
    console.log(
      "ðŸ”µ commentsAPI.getReplies called with commentId:",
      commentId
    );
    return api.get(`/comments/${commentId}/replies`);
  },
};

// ==========================================
// ADMIN API
// ==========================================

export const adminAPI = {
  getAllUsers: () => {
    console.log("ðŸ”µ adminAPI.getAllUsers called");
    return api.get("/admin/users");
  },

  getUserProfile: (userId) => {
    console.log("ðŸ”µ adminAPI.getUserProfile called with userId:", userId);
    return api.get(`/admin/users/${userId}/profile`);
  },

  getUserById: (userId) => {
    console.log("ðŸ”µ adminAPI.getUserById called with userId:", userId);
    return api.get(`/admin/users/${userId}`);
  },

  updateUser: (userId, userData) => {
    console.log("ðŸ”µ adminAPI.updateUser called with userId:", userId);
    return api.put(`/admin/users/${userId}`, userData);
  },

  deleteUser: (userId) => {
    console.log("ðŸ”µ adminAPI.deleteUser called with userId:", userId);
    return api.delete(`/admin/users/${userId}`);
  },

  promoteToLibrarian: (userId) => {
    console.log("ðŸ”µ adminAPI.promoteToLibrarian called with userId:", userId);
    return api.post(`/admin/users/${userId}/promote-librarian`);
  },

  demoteFromLibrarian: (userId) => {
    console.log(
      "ðŸ”µ adminAPI.demoteFromLibrarian called with userId:",
      userId
    );
    return api.post(`/admin/users/${userId}/demote-librarian`);
  },

  deleteBook: (bookId) => {
    console.log("ðŸ”µ adminAPI.deleteBook called with bookId:", bookId);
    return api.delete(`/admin/books/${bookId}`);
  },

  deleteChapter: (chapterId) => {
    console.log(
      "ðŸ”µ adminAPI.deleteChapter called with chapterId:",
      chapterId
    );
    return api.delete(`/admin/chapters/${chapterId}`);
  },

  getPendingReports: () => {
    console.log("ðŸ”µ adminAPI.getPendingReports called");
    return api.get("/admin/reports/pending");
  },

  getNotifications: () => {
    console.log("ðŸ”µ adminAPI.getNotifications called");
    return api.get("/admin/notifications");
  },

  markNotificationRead: (notificationId) => {
    console.log(
      "ðŸ”µ adminAPI.markNotificationRead called with notificationId:",
      notificationId
    );
    return api.put(`/admin/notifications/${notificationId}/read`);
  },

  markReportAsSeen: (reportId) => {
    console.log(
      "ðŸ”µ adminAPI.markReportAsSeen called with reportId:",
      reportId
    );
    return api.post(`/admin/reports/${reportId}/mark-seen`, {
      action_type: "mark_seen",
    });
  },

  reviewReport: (reportId, data) => {
    console.log("ðŸ”µ adminAPI.reviewReport called with reportId:", reportId);
    return api.post(`/admin/reports/${reportId}/review`, data);
  },

  getLogs: () => {
    console.log("ðŸ”µ adminAPI.getLogs called");
    return api.get("/admin/logs");
  },
};

// ==========================================
// LIBRARIAN API
// ==========================================

export const librarianAPI = {
  createReport: (reportData) => {
    console.log("ðŸ”µ librarianAPI.createReport called");
    return api.post("/librarian/reports", reportData);
  },

  getMyReports: (status = "all") => {
    console.log("ðŸ”µ librarianAPI.getMyReports called with status:", status);
    return api.get(`/librarian/reports?status=${status}`);
  },

  deleteReport: (reportId) => {
    console.log(
      "ðŸ”µ librarianAPI.deleteReport called with reportId:",
      reportId
    );
    return api.delete(`/librarian/reports/${reportId}`);
  },

  getStats: () => {
    console.log("ðŸ”µ librarianAPI.getStats called");
    return api.get("/librarian/stats");
  },

  getBooksToReview: (page = 1, limit = 20, search = "") => {
    console.log("ðŸ”µ librarianAPI.getBooksToReview called");
    return api.get(
      `/librarian/books?page=${page}&limit=${limit}&search=${search}`
    );
  },

  getBookChapters: (bookId) => {
    console.log(
      "ðŸ”µ librarianAPI.getBookChapters called with bookId:",
      bookId
    );
    return api.get(`/librarian/books/${bookId}/chapters`);
  },
};

// ==========================================
// UTILIDADES
// ==========================================

export const checkConnection = async () => {
  try {
    console.log("ðŸ” Checking server connection...");
    const response = await api.get("/health");
    console.log("âœ… Server is reachable:", response.data);
    return response.data;
  } catch (error) {
    console.error("âŒ Server connection failed:", error.message);
    throw new Error("No se pudo conectar con el servidor");
  }
};

export default api;
