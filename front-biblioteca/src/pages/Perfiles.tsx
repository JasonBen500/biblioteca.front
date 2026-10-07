import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Perfil } from "../types/Perfil";
import {
  getPerfiles,
  crearPerfil,
  modificarPerfil,
  eliminarPerfil,
  anularPerfil,
} from "../services/perfilesservices";
import Layout from "../components/Layout";

const vacio: Perfil = { idPerfil: 0, nombre: "", estado: true };

export default function Perfiles() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [form, setForm] = useState<Perfil>(vacio);
  const [editando, setEditando] = useState(false);

  const cargar = async () => setPerfiles((await getPerfiles()).data);

  useEffect(() => {
    cargar();
  }, []);

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editando) await modificarPerfil(form.idPerfil, form);
    else await crearPerfil(form);
    setForm(vacio);
    setEditando(false);
    cargar();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Perfiles</h1>

      <form
        onSubmit={manejarSubmit}
        className="bg-white p-4 rounded shadow mb-6 flex gap-3 items-end"
      >
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-2 rounded"
        >
          {editando ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {perfiles.map((p) => (
            <tr key={p.idPerfil} className="border-b">
              <td className="p-2">{p.idPerfil}</td>
              <td className="p-2">{p.nombre}</td>
              <td className="p-2">{p.estado ? "Activo" : "Inactivo"}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => {
                    setForm(p);
                    setEditando(true);
                  }}
                  className="text-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => anularPerfil(p.idPerfil).then(cargar)}
                  className="text-yellow-600"
                >
                  Anular
                </button>
                <button
                  onClick={() => eliminarPerfil(p.idPerfil).then(cargar)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
