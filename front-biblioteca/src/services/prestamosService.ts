import api from "./api";
import type { Prestamo } from "../types/Prestamo";

// Datos para registrar un préstamo completo en una sola llamada.
// Si idSocio no viene, el backend crea el socio con nombreSocio, carnetSocio y telefonoSocio.
export interface PrestamoRegistro {
  idSocio?: number;
  nombreSocio?: string;
  carnetSocio?: string;
  telefonoSocio?: string;
  idUsuario: number;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  idLibros: number[];
}

export const getPrestamos = () => api.get<Prestamo[]>("/prestamos");
export const getPrestamosActivos = () =>
  api.get<Prestamo[]>("/prestamos/activos");
export const crearPrestamo = (data: Prestamo) => api.post("/prestamos", data);
export const registrarPrestamo = (data: PrestamoRegistro) =>
  api.post<Prestamo>("/prestamos/registrar", data);
export const modificarPrestamo = (id: number, data: Prestamo) =>
  api.put(`/prestamos/${id}`, data);
export const eliminarPrestamo = (id: number) => api.delete(`/prestamos/${id}`);
export const anularPrestamo = (id: number) =>
  api.patch(`/prestamos/${id}/anular`);
