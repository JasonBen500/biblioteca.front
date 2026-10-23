import type { Prestamo } from "../types/Prestamo";
import type { Socio } from "../types/Socio";
import { fechaATexto, soloFecha } from "./fechas";
import type { DetallePrestamo } from "../types/DetallePrestamo";
import type { Libro } from "../types/Libro";

// En todas las funciones solo se cuentan los préstamos vigentes (estado = true);
// los anulados no suman.

export interface PrestamosPorDia {
  dia: string; // "Lun", "Mar", ...
  fecha: string; // "2026-10-19"
  prestamos: number;
}

const NOMBRES_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Cuenta los préstamos de cada día de la semana actual (lunes a domingo)
export function prestamosDeLaSemana(prestamos: Prestamo[]): PrestamosPorDia[] {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo
  const desdeLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const vigentes = prestamos.filter((p) => p.estado);

  return NOMBRES_DIAS.map((nombre, i) => {
    const fecha = fechaATexto(
      new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + desdeLunes + i),
    );
    return {
      dia: nombre,
      fecha,
      prestamos: vigentes.filter((p) => soloFecha(p.fechaPrestamo) === fecha)
        .length,
    };
  });
}

// idSocio -> cantidad de préstamos vigentes
export function contarPrestamosPorSocio(
  prestamos: Prestamo[],
): Map<number, number> {
  const conteo = new Map<number, number>();
  prestamos
    .filter((p) => p.estado)
    .forEach((p) => conteo.set(p.idSocio, (conteo.get(p.idSocio) ?? 0) + 1));
  return conteo;
}

export interface SocioRecurrente {
  socio: Socio;
  total: number;
}

// Los socios con más préstamos, de mayor a menor
export function sociosMasRecurrentes(
  prestamos: Prestamo[],
  socios: Socio[],
  limite = 5,
): SocioRecurrente[] {
  const conteo = contarPrestamosPorSocio(prestamos);

  return socios
    .map((socio) => ({ socio, total: conteo.get(socio.idSocio) ?? 0 }))
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}

export interface ComparacionSocio {
  nombre: string;
  prestamos: number;
  libros: number;
  pendientes: number;
}

// Compara a los socios más activos: préstamos, libros prestados y libros sin devolver
export function compararSociosActivos(
  prestamos: Prestamo[],
  socios: Socio[],
  detalles: DetallePrestamo[],
  limite = 5,
): ComparacionSocio[] {
  return sociosMasRecurrentes(prestamos, socios, limite).map(({ socio, total }) => {
    const idsPrestamos = new Set(
      prestamos
        .filter((p) => p.estado && p.idSocio === socio.idSocio)
        .map((p) => p.idPrestamo),
    );
    const delSocio = detalles.filter((d) => idsPrestamos.has(d.idPrestamo));

    return {
      nombre: socio.nombre,
      prestamos: total,
      libros: delSocio.length,
      pendientes: delSocio.filter((d) => d.estado).length,
    };
  });
}

export interface LibroPedido {
  titulo: string;
  pedidos: number;
}

// Los libros que más veces se han prestado (solo préstamos vigentes)
export function librosMasPedidos(
  prestamos: Prestamo[],
  detalles: DetallePrestamo[],
  libros: Libro[],
  limite = 5,
): LibroPedido[] {
  const vigentes = new Set(prestamos.filter((p) => p.estado).map((p) => p.idPrestamo));
  const conteo = new Map<number, number>();
  detalles
    .filter((d) => vigentes.has(d.idPrestamo))
    .forEach((d) => conteo.set(d.idLibro, (conteo.get(d.idLibro) ?? 0) + 1));

  return libros
    .map((l) => ({ titulo: l.titulo, pedidos: conteo.get(l.idLibro) ?? 0 }))
    .filter((l) => l.pedidos > 0)
    .sort((a, b) => b.pedidos - a.pedidos)
    .slice(0, limite);
}

export interface LibroEjemplares {
  titulo: string;
  ejemplares: number;
}

// Los libros activos con más o con menos ejemplares disponibles
export function librosPorEjemplares(
  libros: Libro[],
  orden: "mas" | "menos",
  limite = 5,
): LibroEjemplares[] {
  return libros
    .filter((l) => l.estado)
    .map((l) => ({ titulo: l.titulo, ejemplares: l.ejemplaresDisponibles }))
    .sort((a, b) =>
      orden === "mas" ? b.ejemplares - a.ejemplares : a.ejemplares - b.ejemplares,
    )
    .slice(0, limite);
}