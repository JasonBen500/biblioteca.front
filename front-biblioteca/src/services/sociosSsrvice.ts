import api from "./api";
import type { Socio } from "../types/Socio";

export const getSocios = () => api.get<Socio[]>("/socios");

export const getSociosActivos = () => api.get<Socio[]>("/socios/activos");

export const crearSocio = (data: Socio) => api.post("/socios", data);

export const modificarSocio = (id: number, data: Socio) =>
  api.put(`/socios/${id}`, data);

export const eliminarSocio = (id: number) => api.delete(`/socios/${id}`);

export const anularSocio = (id: number) => api.patch(`/socios/${id}/anular`);

export const buscarSocios = (nombre: string) =>
  api.get<Socio[]>(`/socios/buscar?nombre=${nombre}`);
