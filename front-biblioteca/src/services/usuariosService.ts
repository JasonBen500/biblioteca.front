import api from "./api";
import type { Usuario } from "../types/Usuario";

export const getUsuarios = () => api.get<Usuario[]>("/usuarios");
export const getUsuariosActivos = () => api.get<Usuario[]>("/usuarios/activos");
export const crearUsuario = (data: Usuario) => api.post("/usuarios", data);
export const modificarUsuario = (id: number, data: Usuario) =>
  api.put(`/usuarios/${id}`, data);
export const eliminarUsuario = (id: number) => api.delete(`/usuarios/${id}`);
export const anularUsuario = (id: number) =>
  api.patch(`/usuarios/${id}/anular`);
