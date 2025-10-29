import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadDocument,
  getDocuments,
} from "../services/api";
import {
  captureDocumentWithCamera,
  selectDocumentFromGallery,
  validateDocumentImage,
  prepareDocumentForUpload,
} from "../services/documentScannerService";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

type ProfileScreenRouteProp = RouteProp<RootStackParamList, "Profile">;

interface Props {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

interface InitialData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  profilePhoto: string | null;
}

export default function ProfileScreen({ navigation, route }: Props) {
  const { userId } = route.params;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  useEffect(() => {
    loadProfile();
    loadDocuments();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (initialData) {
      const changed =
        name !== initialData.name ||
        email !== initialData.email ||
        phone !== initialData.phone ||
        address !== initialData.address ||
        bio !== initialData.bio ||
        profilePhoto !== initialData.profilePhoto;

      setHasChanges(changed);
    }
  }, [name, email, phone, address, bio, profilePhoto, initialData]);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    const { status: locationStatus } =
      await Location.requestForegroundPermissionsAsync();
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await getProfile(userId);

      if (response.success && response.user) {
        const user = response.user;
        const initialState = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          bio: user.bio || "",
          profilePhoto: user.profilePhoto || null,
        };

        setInitialData(initialState);
        setName(initialState.name);
        setEmail(initialState.email);
        setPhone(initialState.phone);
        setAddress(initialState.address);
        setBio(initialState.bio);
        setProfilePhoto(initialState.profilePhoto);
      }
    } catch (error: any) {
      Alert.alert("Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await getDocuments(userId);
      if (response.success) {
        setDocuments(response.documents);
      }
    } catch (error) {
      console.error("Error cargando documentos:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!hasChanges) {
      Alert.alert("Sin cambios", "No hay cambios para guardar");
      return;
    }

    setSaving(true);
    try {
      const response = await updateProfile(userId, {
        name,
        email,
        phone,
        address,
        bio,
      });

      if (response.success) {
        setInitialData({
          name,
          email,
          phone,
          address,
          bio,
          profilePhoto,
        });
        setHasChanges(false);
        setShowSuccessModal(true);

        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    Alert.alert("Seleccionar foto", "¿De dónde quieres obtener la foto?", [
      {
        text: "Cámara",
        onPress: () => takePhoto(),
      },
      {
        text: "Galería",
        onPress: () => pickFromGallery(),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert("Error", "No se pudo seleccionar la foto");
    }
  };

  const uploadPhoto = async (uri: string) => {
    setSaving(true);
    try {
      const response = await uploadProfilePhoto(userId, uri);

      if (response.success) {
        setProfilePhoto(uri);
        Alert.alert("Éxito", "Foto de perfil actualizada");
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCaptureDocument = async () => {
    setSaving(true);
    try {
      const result = await captureDocumentWithCamera();

      if (result.success) {
        setDocumentUri(result.uri);
        setShowDocumentPreview(true);
      } else {
        Alert.alert(
          "Error",
          result.error || "No se pudo capturar el documento"
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDocumentFromGallery = async () => {
    setSaving(true);
    try {
      const result = await selectDocumentFromGallery();

      if (result.success) {
        setDocumentUri(result.uri);
        setShowDocumentPreview(true);
      } else {
        Alert.alert(
          "Error",
          result.error || "No se pudo seleccionar el documento"
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDocument = async () => {
    if (!documentUri) return;

    setShowDocumentPreview(false);

    Alert.prompt(
      "Tipo de documento",
      "¿Qué tipo de documento es?",
      async (documentType) => {
        if (documentType) {
          await uploadDocumentFile(documentUri, documentType);
        }
      },
      "plain-text",
      "DNI/Pasaporte"
    );
  };

  const uploadDocumentFile = async (uri: string, documentType: string) => {
    setSaving(true);
    try {
      // Validar documento
      const validation = await validateDocumentImage(uri);
      if (!validation.valid) {
        Alert.alert(
          "Validación fallida",
          validation.error || "Documento inválido"
        );
        setSaving(false);
        return;
      }

      // Preparar para envío
      const prepareResult = await prepareDocumentForUpload(uri, documentType);
      if (!prepareResult.success) {
        Alert.alert(
          "Error",
          prepareResult.error || "No se pudo preparar el documento"
        );
        setSaving(false);
        return;
      }

      // Enviar al servidor
      const response = await uploadDocument(userId, uri, documentType);

      if (response.success) {
        Alert.alert("Éxito", "Documento subido correctamente");
        setDocumentUri(null);
        loadDocuments();
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePickDocument = async () => {
    Alert.alert("Subir documento", "¿Cómo deseas capturar el documento?", [
      {
        text: "Cámara",
        onPress: () => handleCaptureDocument(),
      },
      {
        text: "Galería",
        onPress: () => handleSelectDocumentFromGallery(),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  // Reemplaza la función handleGetLocation en ProfileScreen.tsx con esta versión
  // que NO usa reverseGeocodeAsync (removido en SDK 49)

  const handleGetLocation = async () => {
    setSaving(true);

    try {
      // 1. Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso Denegado",
          "Para usar esta función, necesitas habilitar los permisos de ubicación en la configuración de tu dispositivo."
        );
        setSaving(false);
        return;
      }

      // 2. Obtener ubicación actual (solo coordenadas)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 3. Mostrar coordenadas (ya que no tenemos geocoding)
      const coordsAddress = `Lat: ${latitude.toFixed(
        6
      )}, Lng: ${longitude.toFixed(6)}`;

      // 4. Preguntar al usuario si quiere guardar estas coordenadas
      Alert.alert(
        "Ubicación Detectada",
        `Se detectaron las siguientes coordenadas:\n\n${coordsAddress}\n\n¿Deseas guardar esta ubicación? Luego puedes editar la dirección manualmente.`,
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setSaving(false),
          },
          {
            text: "Guardar",
            onPress: async () => {
              try {
                // Guardar coordenadas y una dirección temporal
                const response = await updateProfile(userId, {
                  address: address || coordsAddress, // Si ya hay dirección, mantenerla
                  latitude,
                  longitude,
                });

                if (response.success) {
                  // Actualizar datos iniciales
                  if (initialData) {
                    setInitialData({
                      ...initialData,
                      address: address || coordsAddress,
                    });
                  }

                  Alert.alert(
                    "✓ Éxito",
                    "Ubicación guardada correctamente.\n\nTip: Puedes editar el campo 'Dirección' manualmente para poner tu dirección completa."
                  );
                } else {
                  Alert.alert(
                    "Error",
                    "No se pudo guardar la ubicación en el servidor"
                  );
                }
              } catch (error) {
                Alert.alert("Error", "No se pudo guardar la ubicación");
              } finally {
                setSaving(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error obteniendo ubicación:", error);

      let errorMessage = "No se pudo obtener la ubicación. ";

      if (error.code === "E_LOCATION_SERVICES_DISABLED") {
        errorMessage +=
          "Los servicios de ubicación están desactivados. Actívalos en la configuración.";
      } else if (error.code === "E_LOCATION_TIMEOUT") {
        errorMessage +=
          "La búsqueda tardó demasiado. Intenta en un área con mejor señal GPS.";
      } else if (error.code === "E_LOCATION_UNAVAILABLE") {
        errorMessage +=
          "La ubicación no está disponible. Verifica que tengas GPS activado.";
      } else {
        errorMessage += `Error: ${error.message}`;
      }

      Alert.alert("Error de Ubicación", errorMessage);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Foto de perfil */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={handlePickImage} disabled={saving}>
              {profilePhoto ? (
                <Image
                  source={{
                    uri: profilePhoto.startsWith("http")
                      ? profilePhoto
                      : `http://192.168.100.86:3000${profilePhoto}`,
                  }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <Text style={styles.profilePhotoText}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHint}>Toca para cambiar foto</Text>
          </View>

          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              editable={!saving}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+54 9 11 1234-5678"
              keyboardType="phone-pad"
              editable={!saving}
            />

            <Text style={styles.label}>Biografía</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Cuéntanos sobre ti..."
              multiline
              numberOfLines={4}
              editable={!saving}
            />
          </View>

          {/* Ubicación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>

            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Tu dirección"
              multiline
              editable={!saving}
            />

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetLocation}
              disabled={saving}
            >
              <Text style={styles.locationButtonText}>
                📍 Usar mi ubicación actual
              </Text>
            </TouchableOpacity>
          </View>

          {/* Documentos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Documentos (Escaneo Ficticio)
            </Text>

            <Text style={styles.helpText}>
              Captura o selecciona una imagen que simule ser un documento de
              identificación.
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickDocument}
              disabled={saving}
            >
              <Text style={styles.uploadButtonText}>📄 Escanear Documento</Text>
            </TouchableOpacity>

            {documents.length > 0 && (
              <View style={styles.documentsListContainer}>
                <Text style={styles.documentsListTitle}>
                  Documentos subidos ({documents.length})
                </Text>
                {documents.map((doc, index) => (
                  <View key={doc.id || index} style={styles.documentItem}>
                    <Text style={styles.documentType}>{doc.document_type}</Text>
                    <Text style={styles.documentDate}>
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Estado de cambios */}
          {!hasChanges && (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                No hay cambios para guardar
              </Text>
            </View>
          )}

          {/* Botón guardar */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || saving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveProfile}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Modal de vista previa del documento */}
      <Modal
        visible={showDocumentPreview}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowDocumentPreview(false);
                setDocumentUri(null);
              }}
            >
              <Text style={styles.previewCloseText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Vista Previa</Text>
            <TouchableOpacity onPress={handleConfirmDocument}>
              <Text style={styles.previewConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {documentUri && (
            <Image
              source={{ uri: documentUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.previewInfo}>
            <Text style={styles.previewInfoTitle}>
              ℹ️ Validación de Documento
            </Text>
            <Text style={styles.previewInfoText}>
              Este escaneo es ficticio para demostración. En una aplicación
              real, se validarían datos del documento.
            </Text>
            <Text style={styles.previewInfoText}>
              Se aceptan: JPEG, PNG, PDF (máximo 5MB)
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación */}
      <Modal visible={showSuccessModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Cambios Guardados</Text>
            <Text style={styles.modalMessage}>
              Tu perfil se ha actualizado correctamente.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  content: {
    padding: 20,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePhotoText: {
    fontSize: 50,
  },
  photoHint: {
    marginTop: 10,
    fontSize: 14,
    color: "#007AFF",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  locationButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  documentsListContainer: {
    marginTop: 15,
  },
  documentsListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  documentItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  documentType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  documentDate: {
    fontSize: 12,
    color: "#666",
  },
  infoBox: {
    backgroundColor: "#fff3cd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  infoBoxText: {
    fontSize: 14,
    color: "#856404",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 40,
  },
  // Estilos del modal de vista previa
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  previewCloseText: {
    color: "#fff",
    fontSize: 16,
  },
  previewTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  previewConfirmText: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "bold",
  },
  previewImage: {
    flex: 1,
    width: "100%",
  },
  previewInfo: {
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
  },
  previewInfoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  previewInfoText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
  },
  // Estilos del modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 400,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 50,
    color: "#fff",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
