import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { DetallePrestamo as DetalleType } from "../types/DetallePrestamo";
import type { Prestamo } from "../types/Prestamo";
import type { Libro } from "../types/Libro";
import {
  getDetallePrestamo,
  crearDetallePrestamo,
  modificarDetallePrestamo,
  eliminarDetallePrestamo,
  anularDetallePrestamo,
} from "../services/detallePrestamoService";
import { getPrestamos } from "../services/prestamosService";
import { getLibros } from "../services/librosService";
import Layout from "../components/Layout";

const vacio: DetalleType = { idDetallePrestamo: 0, idPrestamo: 0, idLibro: 0, fechaDevolucionReal: "" };

export default function DetallePrestamo() {
  const [detalles, setDetalles] = useState<DetalleType[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [form, setForm] = useState<DetalleType>(vacio);
  const [editando, setEditando] = useState(false);

  const cargar = async () => setDetalles((await getDetallePrestamo()).data);

  useEffect(() => {
    cargar();
    getPrestamos().then((res) => setPrestamos(res.data));
    getLibros().then((res) => setLibros(res.data));
  }, []);

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editando) await modificarDetallePrestamo(form.idDetallePrestamo, form);
    else await crearDetallePrestamo(form);
    setForm(vacio);
    setEditando(false);
    cargar();
  };

  const manejarAnular = async (id: number) => {
    const hoy = new Date().toISOString().split("T")[0];
    await anularDetallePrestamo(id, { fechaDevolucionReal: hoy });
    cargar();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Detalle de Préstamo</h1>

      <form onSubmit={manejarSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Préstamo</label>
          <select value={form.idPrestamo} onChange={(e) => setForm({ ...form, idPrestamo: Number(e.target.value) })} className="border rounded px-3 py-2 w-full" required>
            <option value={0}>Seleccione...</option>
            {prestamos.map((p) => (
              <option key={p.idPrestamo} value={p.idPrestamo}>Préstamo #{p.idPrestamo}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Libro</label>
          <select value={form.idLibro} onChange={(e) => setForm({ ...form, idLibro: Number(e.target.value) })} className="border rounded px-3 py-2 w-full" required>
            <option value={0}>Seleccione...</option>
            {libros.map((l) => (
              <option key={l.idLibro} value={l.idLibro}>{l.titulo}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded">
            {editando ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </form>

      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Préstamo</th>
            <th className="p-2 text-left">Libro</th>
            <th className="p-2 text-left">Devolución real</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((d) => (
            <tr key={d.idDetallePrestamo} className="border-b">
              <td className="p-2">{d.idDetallePrestamo}</td>
              <td className="p-2">#{d.idPrestamo}</td>
              <td className="p-2">{libros.find((l) => l.idLibro === d.idLibro)?.titulo ?? d.idLibro}</td>
              <td className="p-2">{d.fechaDevolucionReal || "Pendiente"}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => { setForm(d); setEditando(true); }} className="text-blue-600">Editar</button>
                <button onClick={() => manejarAnular(d.idDetallePrestamo)} className="text-yellow-600">Marcar devuelto</button>
                <button onClick={() => eliminarDetallePrestamo(d.idDetallePrestamo).then(cargar)} className="text-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}