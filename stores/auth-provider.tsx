import {
  loadUserFromLocalStorage,
  setUserInLocalstorage,
} from "@/utils/storage";
import React from "react";

export interface User {
  name: string;
}

interface IAuthContext {
  user: User;
  setUser: (user: User) => void;
}

const AuthContext = React.createContext<IAuthContext>({
  user: { name: "" },
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>({ name: "" });

  React.useEffect(() => {
    loadUserFromLocalStorage().then((user) => user && setUser(user));
  }, []);

  async function setUserData(user: User) {
    setUserInLocalstorage(user).then(() => setUser(user));
  }

  return (
    <AuthContext.Provider value={{ user, setUser: setUserData }}>
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
