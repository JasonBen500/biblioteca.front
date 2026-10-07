import api from "./api";
import type { Libro } from "../types/Libro";

export const getLibros = () => api.get<Libro[]>("/libros");
export const getLibrosActivos = () => api.get<Libro[]>("/libros/activos");
export const crearLibro = (data: Libro) => api.post("/libros", data);
export const modificarLibro = (id: number, data: Libro) =>
  api.put(`/libros/${id}`, data);
export const eliminarLibro = (id: number) => api.delete(`/libros/${id}`);
export const anularLibro = (id: number) => api.patch(`/libros/${id}/anular`);
