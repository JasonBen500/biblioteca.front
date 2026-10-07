import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Prestamo } from "../types/Prestamo";
import type { Socio } from "../types/Socio";
import type { Usuario } from "../types/Usuario";
import {
  getPrestamos,
  crearPrestamo,
  modificarPrestamo,
  eliminarPrestamo,
  anularPrestamo,
} from "../services/prestamosService";
import { getSocios } from "../services/sociosSsrvice";
import { getUsuarios } from "../services/usuariosService";
import Layout from "../components/Layout";

const vacio: Prestamo = {
  idPrestamo: 0,
  idSocio: 0,
  idUsuario: 0,
  fechaPrestamo: "",
  fechaDevolucionEsperada: "",
  estado: true,
};

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<Prestamo>(vacio);
  const [editando, setEditando] = useState(false);

  const cargar = async () => setPrestamos((await getPrestamos()).data);

  useEffect(() => {
    cargar();
    getSocios().then((res) => setSocios(res.data));
    getUsuarios().then((res) => setUsuarios(res.data));
  }, []);

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editando) await modificarPrestamo(form.idPrestamo, form);
    else await crearPrestamo(form);
    setForm(vacio);
    setEditando(false);
    cargar();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Préstamos</h1>

      <form
        onSubmit={manejarSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-3"
      >
        <div>
          <label className="block text-sm mb-1">Socio</label>
          <select
            value={form.idSocio}
            onChange={(e) =>
              setForm({ ...form, idSocio: Number(e.target.value) })
            }
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value={0}>Seleccione...</option>
            {socios.map((s) => (
              <option key={s.idSocio} value={s.idSocio}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Atendido por</label>
          <select
            value={form.idUsuario}
            onChange={(e) =>
              setForm({ ...form, idUsuario: Number(e.target.value) })
            }
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value={0}>Seleccione...</option>
            {usuarios.map((u) => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha de préstamo</label>
          <input
            type="date"
            value={form.fechaPrestamo}
            onChange={(e) =>
              setForm({ ...form, fechaPrestamo: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Devolución esperada</label>
          <input
            type="date"
            value={form.fechaDevolucionEsperada}
            onChange={(e) =>
              setForm({ ...form, fechaDevolucionEsperada: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
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
            <th className="p-2 text-left">Socio</th>
            <th className="p-2 text-left">Atendido por</th>
            <th className="p-2 text-left">Préstamo</th>
            <th className="p-2 text-left">Dev. esperada</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prestamos.map((p) => (
            <tr key={p.idPrestamo} className="border-b">
              <td className="p-2">{p.idPrestamo}</td>
              <td className="p-2">
                {socios.find((s) => s.idSocio === p.idSocio)?.nombre ??
                  p.idSocio}
              </td>
              <td className="p-2">
                {usuarios.find((u) => u.idUsuario === p.idUsuario)?.nombre ??
                  p.idUsuario}
              </td>
              <td className="p-2">{p.fechaPrestamo}</td>
              <td className="p-2">{p.fechaDevolucionEsperada}</td>
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
                  onClick={() => anularPrestamo(p.idPrestamo).then(cargar)}
                  className="text-yellow-600"
                >
                  Anular
                </button>
                <button
                  onClick={() => eliminarPrestamo(p.idPrestamo).then(cargar)}
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
