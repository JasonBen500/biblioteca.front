import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Usuario } from "../types/Usuario";
import type { Perfil } from "../types/Perfil";
import {
  getUsuarios,
  crearUsuario,
  modificarUsuario,
  eliminarUsuario,
  anularUsuario,
} from "../services/usuariosService";
import { getPerfiles } from "../services/perfilesservices";
import Layout from "../components/Layout";

const vacio: Usuario = { idUsuario: 0, idPerfil: 0, nombre: "", usuario: "", contrasena: "", correo: "", estado: true };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [form, setForm] = useState<Usuario>(vacio);
  const [editando, setEditando] = useState(false);

  const cargar = async () => setUsuarios((await getUsuarios()).data);

  useEffect(() => {
    cargar();
    getPerfiles().then((res) => setPerfiles(res.data));
  }, []);

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editando) await modificarUsuario(form.idUsuario, form);
    else await crearUsuario(form);
    setForm(vacio);
    setEditando(false);
    cargar();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      <form onSubmit={manejarSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Usuario</label>
          <input type="text" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input type="password" value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Correo</label>
          <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Perfil</label>
          <select value={form.idPerfil} onChange={(e) => setForm({ ...form, idPerfil: Number(e.target.value) })} className="border rounded px-3 py-2 w-full" required>
            <option value={0}>Seleccione...</option>
            {perfiles.map((p) => (
              <option key={p.idPerfil} value={p.idPerfil}>{p.nombre}</option>
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
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Usuario</th>
            <th className="p-2 text-left">Correo</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.idUsuario} className="border-b">
              <td className="p-2">{u.idUsuario}</td>
              <td className="p-2">{u.nombre}</td>
              <td className="p-2">{u.usuario}</td>
              <td className="p-2">{u.correo}</td>
              <td className="p-2">{u.estado ? "Activo" : "Inactivo"}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => { setForm(u); setEditando(true); }} className="text-blue-600">Editar</button>
                <button onClick={() => anularUsuario(u.idUsuario).then(cargar)} className="text-yellow-600">Anular</button>
                <button onClick={() => eliminarUsuario(u.idUsuario).then(cargar)} className="text-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}