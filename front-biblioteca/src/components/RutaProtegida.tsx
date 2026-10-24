import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { puedeAcceder } from "../utils/permisos";

export default function RutaProtegida({ children }: { children: ReactNode }) {
  const { usuario, rol } = useAuth();
  const { pathname } = useLocation();

  if (!usuario) return <Navigate to="/login" replace />;
  // Sin permiso para esta página: vuelve al inicio
  if (!puedeAcceder(rol, pathname)) return <Navigate to="/" replace />;

  return <>{children}</>;
}