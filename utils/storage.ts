import { User } from "@/stores/auth-provider";
import { Task } from "@/stores/task-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadUserFromLocalStorage(): Promise<User | null> {
  const user = await AsyncStorage.getItem("user");
  if (!user) return null;

  return JSON.parse(user) as User;
}

export async function setUserInLocalstorage(user: User) {
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

export async function saveTasksInLocalstorage(tasks: Task[]) {
  await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
}

export async function loadTasksFromLocalstorage(): Promise<Task[]> {
  const tasks = await AsyncStorage.getItem("tasks");
  if (!tasks) return [];
  return JSON.parse(tasks) as Task[];
}
