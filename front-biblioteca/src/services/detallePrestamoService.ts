import api from "./api";
import type { DetallePrestamo } from "../types/DetallePrestamo";

export const getDetallePrestamo = () =>
  api.get<DetallePrestamo[]>("/detalle-prestamo");
export const getDetallePorPrestamo = (idPrestamo: number) =>
  api.get<DetallePrestamo[]>(`/detalle-prestamo/prestamo/${idPrestamo}`);
export const crearDetallePrestamo = (data: DetallePrestamo) =>
  api.post("/detalle-prestamo", data);
export const modificarDetallePrestamo = (id: number, data: DetallePrestamo) =>
  api.put(`/detalle-prestamo/${id}`, data);
export const eliminarDetallePrestamo = (id: number) =>
  api.delete(`/detalle-prestamo/${id}`);
export const anularDetallePrestamo = (
  id: number,
  data: Partial<DetallePrestamo>,
) => api.patch(`/detalle-prestamo/${id}/anular`, data);
