import AsyncStorage from "@react-native-async-storage/async-storage";

export const BACKEND_URL = "https://travel-tales-f0hb.onrender.com";

export async function getUsername(): Promise<string> {
  let username = await AsyncStorage.getItem("loggedInUser");
  if (!username) {
    username = await AsyncStorage.getItem("anonUserId");
    if (!username) {
      username = `anonymous-${Date.now()}`;
      await AsyncStorage.setItem("anonUserId", username);
      console.log("🔑 Created new anonUserId:", username);
    }
  }
  console.log("🔑 Using username:", username);
  return username;
}