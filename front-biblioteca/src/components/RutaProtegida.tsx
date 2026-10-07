import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
