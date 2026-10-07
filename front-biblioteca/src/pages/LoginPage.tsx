import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const respuesta = await login({ usuario, contrasena });
      iniciarSesion(respuesta.data);
      navigate("/perfiles");
    } catch {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={manejarSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Biblioteca</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
