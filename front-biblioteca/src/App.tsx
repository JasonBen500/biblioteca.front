import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";
import LoginPage from "./pages/LoginPage";
import Perfiles from "./pages/Perfiles";
import Usuarios from "./pages/Usuarios";
import Socios from "./pages/Socios";
import Libros from "./pages/Libros";
import Prestamos from "./pages/Prestamos";
import DetallePrestamo from "./pages/DetallePrestamo";
import NuevoPrestamo from "./pages/NuevoPrestamo";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/perfiles"
          element={
            <RutaProtegida>
              <Perfiles />
            </RutaProtegida>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RutaProtegida>
              <Usuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/socios"
          element={
            <RutaProtegida>
              <Socios />
            </RutaProtegida>
          }
        />
        <Route
          path="/libros"
          element={
            <RutaProtegida>
              <Libros />
            </RutaProtegida>
          }
        />
        <Route
          path="/prestamos"
          element={
            <RutaProtegida>
              <Prestamos />
            </RutaProtegida>
          }
        />
        <Route
          path="/detalle-prestamo"
          element={
            <RutaProtegida>
              <DetallePrestamo />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route
          path="/nuevo-prestamo"
          element={
            <RutaProtegida>
              <NuevoPrestamo />
            </RutaProtegida>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
