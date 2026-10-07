import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Socio } from "../types/Socio";
import {
  getSocios,
  crearSocio,
  modificarSocio,
  eliminarSocio,
  anularSocio,
} from "../services/sociosSsrvice";
import Layout from "../components/Layout";

const vacio: Socio = {
  idSocio: 0,
  nombre: "",
  carnet: "",
  telefono: "",
  estado: true,
};

export default function Socios() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [form, setForm] = useState<Socio>(vacio);
  const [editando, setEditando] = useState(false);

  const cargar = async () => setSocios((await getSocios()).data);

  useEffect(() => {
    cargar();
  }, []);

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editando) await modificarSocio(form.idSocio, form);
    else await crearSocio(form);
    setForm(vacio);
    setEditando(false);
    cargar();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Socios</h1>

      <form
        onSubmit={manejarSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-3 gap-3"
      >
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Carnet</label>
          <input
            type="text"
            value={form.carnet}
            onChange={(e) => setForm({ ...form, carnet: e.target.value })}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Teléfono</label>
          <input
            type="text"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="col-span-3">
          <button
            type="submit"
            className="bg-slate-800 text-white px-4 py-2 rounded"
          >
            {editando ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </form>

      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Carnet</th>
            <th className="p-2 text-left">Teléfono</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {socios.map((s) => (
            <tr key={s.idSocio} className="border-b">
              <td className="p-2">{s.idSocio}</td>
              <td className="p-2">{s.nombre}</td>
              <td className="p-2">{s.carnet}</td>
              <td className="p-2">{s.telefono}</td>
              <td className="p-2">{s.estado ? "Activo" : "Inactivo"}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => {
                    setForm(s);
                    setEditando(true);
                  }}
                  className="text-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => anularSocio(s.idSocio).then(cargar)}
                  className="text-yellow-600"
                >
                  Anular
                </button>
                <button
                  onClick={() => eliminarSocio(s.idSocio).then(cargar)}
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
