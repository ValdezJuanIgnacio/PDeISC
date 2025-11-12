import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem("userToken", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const storeUser = async (user) => {
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user:", error);
  }
};

export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};
