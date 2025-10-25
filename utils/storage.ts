import { User } from "@/stores/auth-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadUserFromLocalStorage(): Promise<User | null> {
  const user = await AsyncStorage.getItem("user");
  if (!user) return null;

  return JSON.parse(user) as User;
}

export async function setUserInLocalstorage(user: User) {
  await AsyncStorage.setItem("user", JSON.stringify(user));
}
