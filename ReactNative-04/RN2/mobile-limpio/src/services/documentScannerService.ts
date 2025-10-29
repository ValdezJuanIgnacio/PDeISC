import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { CameraView, useCameraPermissions } from "expo-camera";

/**
 * Servicio para capturar y procesar documentos (ficticio)
 * Propósito: Demostración de uso de herramientas Expo
 */

export interface DocumentScanResult {
  uri: string;
  base64?: string;
  fileName: string;
  fileSize: number;
  success: boolean;
  error?: string;
}

/**
 * Capturar documento con la cámara
 * Uso: expo-camera para captura en tiempo real
 */
export const captureDocumentWithCamera =
  async (): Promise<DocumentScanResult> => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        base64: false,
      });

      if (result.canceled || !result.assets[0]) {
        return {
          uri: "",
          fileName: "",
          fileSize: 0,
          success: false,
          error: "Captura cancelada",
        };
      }

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      return {
        uri: asset.uri,
        fileName: `document_${Date.now()}.jpg`,
        fileSize:
          fileInfo.exists && "size" in fileInfo
            ? (fileInfo as any).size || 0
            : 0,
        success: true,
      };
    } catch (error: any) {
      return {
        uri: "",
        fileName: "",
        fileSize: 0,
        success: false,
        error: error.message,
      };
    }
  };

/**
 * Seleccionar documento de la galería
 * Uso: expo-image-picker y expo-document-picker
 */
export const selectDocumentFromGallery =
  async (): Promise<DocumentScanResult> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        base64: false,
      });

      if (result.canceled || !result.assets[0]) {
        return {
          uri: "",
          fileName: "",
          fileSize: 0,
          success: false,
          error: "Selección cancelada",
        };
      }

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      return {
        uri: asset.uri,
        fileName: `document_${Date.now()}.jpg`,
        fileSize:
          fileInfo.exists && "size" in fileInfo
            ? (fileInfo as any).size || 0
            : 0,
        success: true,
      };
    } catch (error: any) {
      return {
        uri: "",
        fileName: "",
        fileSize: 0,
        success: false,
        error: error.message,
      };
    }
  };

/**
 * Convertir imagen a Base64
 * Útil para envío al servidor
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error: any) {
    console.error("Error convirtiendo a Base64:", error);
    return "";
  }
};

/**
 * Validar que sea una imagen válida (JPEG, PNG)
 * Validación básica: Solo verificar formato
 */
export const validateDocumentImage = async (
  uri: string
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      return { valid: false, error: "El archivo no existe" };
    }

    // Validar extensión
    const validExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const hasValidExtension = validExtensions.some((ext) =>
      uri.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        valid: false,
        error: "Formato no válido. Solo JPEG, PNG o PDF",
      };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (fileInfo.size && fileInfo.size > maxSize) {
      return {
        valid: false,
        error: "El archivo es demasiado grande (máx 5MB)",
      };
    }

    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
};

/**
 * Guardar imagen localmente en caché de Expo
 * Uso: expo-file-system
 */
export const saveDocumentLocally = async (
  sourceUri: string,
  documentType: string
): Promise<{ success: boolean; uri?: string; error?: string }> => {
  try {
    const fileName = `${documentType}_${Date.now()}.jpg`;
    const targetUri = `${FileSystem.cacheDirectory}documents/${fileName}`;

    // Crear carpeta si no existe
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.cacheDirectory}documents`,
      { intermediates: true }
    );

    // Copiar archivo
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri,
    });

    return { success: true, uri: targetUri };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Preparar documento para envío al servidor
 * Incluye Base64 y metadatos
 */
export const prepareDocumentForUpload = async (
  uri: string,
  documentType: string
): Promise<{
  success: boolean;
  data?: {
    fileName: string;
    base64: string;
    mimeType: string;
    size: number;
    documentType: string;
  };
  error?: string;
}> => {
  try {
    // Validar documento
    const validation = await validateDocumentImage(uri);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Convertir a Base64
    const base64 = await imageToBase64(uri);
    if (!base64) {
      return { success: false, error: "No se pudo convertir a Base64" };
    }

    // Obtener información del archivo
    const fileInfo = await FileSystem.getInfoAsync(uri);

    // Determinar tipo MIME
    const fileName = uri.split("/").pop() || "document.jpg";
    let mimeType = "image/jpeg";
    if (fileName.toLowerCase().endsWith(".png")) {
      mimeType = "image/png";
    } else if (fileName.toLowerCase().endsWith(".pdf")) {
      mimeType = "application/pdf";
    }

    return {
      success: true,
      data: {
        fileName,
        base64,
        mimeType,
        size:
          fileInfo.exists && "size" in fileInfo
            ? (fileInfo as any).size || 0
            : 0,
        documentType,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtener URI del archivo almacenado localmente
 * Útil para mostrar en la aplicación
 */
export const getStoredDocumentUri = async (
  documentType: string
): Promise<string | null> => {
  try {
    const documentsDir = `${FileSystem.cacheDirectory}documents`;
    const files = await FileSystem.readDirectoryAsync(documentsDir);

    // Buscar archivos del tipo especificado
    const documentFile = files.find((file) => file.startsWith(documentType));

    if (documentFile) {
      return `${documentsDir}/${documentFile}`;
    }

    return null;
  } catch (error) {
    console.error("Error obteniendo documento:", error);
    return null;
  }
};

/**
 * Limpiar documentos almacenados localmente
 * Usa expo-file-system
 */
export const cleanupLocalDocuments = async (): Promise<boolean> => {
  try {
    const documentsDir = `${FileSystem.cacheDirectory}documents`;
    await FileSystem.deleteAsync(documentsDir, { idempotent: true });
    return true;
  } catch (error) {
    console.error("Error limpiando documentos:", error);
    return false;
  }
};

/**
 * Simular la persistencia del documento
 * Preparar objeto para envío al servidor
 */
export const simulateDocumentPersistence = async (
  uri: string,
  documentType: string
): Promise<{
  success: boolean;
  simulatedUploadData?: {
    fileName: string;
    documentType: string;
    uploadTime: string;
    status: "pending" | "uploaded";
  };
  error?: string;
}> => {
  try {
    const fileName = uri.split("/").pop() || "document.jpg";

    return {
      success: true,
      simulatedUploadData: {
        fileName,
        documentType,
        uploadTime: new Date().toISOString(),
        status: "pending",
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
