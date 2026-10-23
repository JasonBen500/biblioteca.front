import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import RutaProtegida from "./components/RutaProtegida";
import LoginPage from "./pages/LoginPage";
import PaginaPrincipal from "./pages/PaginaPrincipal";
import Perfiles from "./pages/Perfiles";
import Usuarios from "./pages/Usuarios";
import Socios from "./pages/Socios";
import Libros from "./pages/Libros";
import Prestamos from "./pages/Prestamos";
import DetallePrestamo from "./pages/DetallePrestamo";
import Reportes from "./pages/Reportes";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Todas las páginas con sesión comparten el sidebar */}
        <Route
          element={
            <RutaProtegida>
              <Layout />
            </RutaProtegida>
          }
        >
          <Route path="/" element={<PaginaPrincipal />} />
          <Route path="/libros" element={<Libros />} />
          <Route path="/socios" element={<Socios />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/detalle-prestamo" element={<DetallePrestamo />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/perfiles" element={<Perfiles />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}