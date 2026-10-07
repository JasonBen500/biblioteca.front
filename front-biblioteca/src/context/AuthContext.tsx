import { createContext, useContext, useState, type ReactNode } from "react";
import type { LoginResponse } from "../types/LoginResponse";

interface AuthContextType {
  usuario: LoginResponse | null;
  iniciarSesion: (data: LoginResponse) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<LoginResponse | null>(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  const iniciarSesion = (data: LoginResponse) => {
    localStorage.setItem("usuario", JSON.stringify(data));
    setUsuario(data);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}