import api from "./api";
import type { Prestamo } from "../types/Prestamo";

export const getPrestamos = () => api.get<Prestamo[]>("/prestamos");
export const getPrestamosActivos = () =>
  api.get<Prestamo[]>("/prestamos/activos");
export const crearPrestamo = (data: Prestamo) => api.post("/prestamos", data);
export const modificarPrestamo = (id: number, data: Prestamo) =>
  api.put(`/prestamos/${id}`, data);
export const eliminarPrestamo = (id: number) => api.delete(`/prestamos/${id}`);
export const anularPrestamo = (id: number) =>
  api.patch(`/prestamos/${id}/anular`);
