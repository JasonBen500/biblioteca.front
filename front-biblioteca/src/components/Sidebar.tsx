import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const opciones = [
  { ruta: "/perfiles", nombre: "Perfiles" },
  { ruta: "/usuarios", nombre: "Usuarios" },
  { ruta: "/socios", nombre: "Socios" },
  { ruta: "/libros", nombre: "Libros" },
  { ruta: "/prestamos", nombre: "Préstamos" },
  { ruta: "/detalle-prestamo", nombre: "Detalle de Préstamo" },
];

export default function Sidebar() {
  const [abierto, setAbierto] = useState(true);
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`h-screen bg-slate-800 text-white flex flex-col transition-all duration-300 ${
        abierto ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {abierto && <span className="font-bold text-lg">Biblioteca</span>}
        <button
          onClick={() => setAbierto(!abierto)}
          className="text-white p-1 hover:bg-slate-700 rounded"
        >
          {abierto ? "←" : "→"}
        </button>
      </div>

      <div className="p-3 border-b border-slate-700">
        <button
          onClick={() => navigate("/nuevo-prestamo")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded text-sm font-semibold"
        >
          {abierto ? "NUEVO PRÉSTAMO" : "+"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {opciones.map((op) => (
          <Link
            key={op.ruta}
            to={op.ruta}
            className={`block px-4 py-3 hover:bg-slate-700 ${location.pathname === op.ruta ? "bg-slate-700" : ""}`}
          >
            {abierto ? op.nombre : op.nombre.charAt(0)}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        {abierto && usuario && (
          <div className="mb-2 text-sm">
            <p className="font-semibold">{usuario.nombre}</p>
            <p className="text-slate-400">{usuario.nombrePerfil}</p>
          </div>
        )}
        <button
          onClick={cerrarSesion}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm"
        >
          {abierto ? "Cerrar sesión" : "⎋"}
        </button>
      </div>
    </aside>
  );
}
