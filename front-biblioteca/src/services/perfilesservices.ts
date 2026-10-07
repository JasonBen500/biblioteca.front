import api from "./api";
import type { Perfil } from "../types/Perfil";

export const getPerfiles = () => api.get<Perfil[]>("/perfiles");
export const getPerfilesActivos = () => api.get<Perfil[]>("/perfiles/activos");
export const crearPerfil = (data: Perfil) => api.post("/perfiles", data);
export const modificarPerfil = (id: number, data: Perfil) =>
  api.put(`/perfiles/${id}`, data);
export const eliminarPerfil = (id: number) => api.delete(`/perfiles/${id}`);
export const anularPerfil = (id: number) => api.patch(`/perfiles/${id}/anular`);
