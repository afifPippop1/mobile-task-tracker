import {
  loadUserFromLocalStorage,
  removeTasksInLocalstorage,
  removeUserInLocalstorage,
  setUserInLocalstorage,
} from "@/utils/storage";
import React from "react";

export interface User {
  name: string;
}

interface IAuthContext {
  user: User;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<IAuthContext>({
  user: { name: "" },
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>({ name: "" });

  React.useEffect(() => {
    loadUserFromLocalStorage().then((user) => user && setUser(user));
  }, []);

  async function setUserData(user: User) {
    setUserInLocalstorage(user).then(() => setUser(user));
  }

  async function logout() {
    await removeUserInLocalstorage();
    setUser({ name: "" });
    await removeTasksInLocalstorage();
  }

  return (
    <AuthContext.Provider value={{ user, setUser: setUserData, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return ctx;
}
