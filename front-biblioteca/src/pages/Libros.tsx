import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Libro } from "../types/Libro";
import {
  getLibros,
  crearLibro,
  modificarLibro,
  eliminarLibro,
  anularLibro,
} from "../services/librosService";
import Layout from "../components/Layout";

const vacio: Libro = {
  idLibro: 0,
  titulo: "",
  autor: "",
  isbn: "",
  ejemplaresDisponibles: 0,
  estado: true,
};

export default function Libros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [form, setForm] = useState<Libro>(vacio);
  const [editando, setEditando] = useState(false);

  const cargar = async () => setLibros((await getLibros()).data);

  useEffect(() => {
    cargar();
  }, []);

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editando) await modificarLibro(form.idLibro, form);
    else await crearLibro(form);
    setForm(vacio);
    setEditando(false);
    cargar();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Libros</h1>

      <form
        onSubmit={manejarSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-3"
      >
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Autor</label>
          <input
            type="text"
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">ISBN</label>
          <input
            type="text"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Ejemplares disponibles</label>
          <input
            type="number"
            value={form.ejemplaresDisponibles}
            onChange={(e) =>
              setForm({
                ...form,
                ejemplaresDisponibles: Number(e.target.value),
              })
            }
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div className="col-span-2">
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
            <th className="p-2 text-left">Título</th>
            <th className="p-2 text-left">Autor</th>
            <th className="p-2 text-left">ISBN</th>
            <th className="p-2 text-left">Disponibles</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {libros.map((l) => (
            <tr key={l.idLibro} className="border-b">
              <td className="p-2">{l.idLibro}</td>
              <td className="p-2">{l.titulo}</td>
              <td className="p-2">{l.autor}</td>
              <td className="p-2">{l.isbn}</td>
              <td className="p-2">{l.ejemplaresDisponibles}</td>
              <td className="p-2">{l.estado ? "Activo" : "Inactivo"}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => {
                    setForm(l);
                    setEditando(true);
                  }}
                  className="text-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => anularLibro(l.idLibro).then(cargar)}
                  className="text-yellow-600"
                >
                  Anular
                </button>
                <button
                  onClick={() => eliminarLibro(l.idLibro).then(cargar)}
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
