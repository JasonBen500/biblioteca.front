import { textoFecha, type ColumnaExportacion } from "./exportar";
import type { Libro } from "../types/Libro";
import type { Socio } from "../types/Socio";
import type { Prestamo } from "../types/Prestamo";
import type { DetallePrestamo } from "../types/DetallePrestamo";
import type { Usuario } from "../types/Usuario";
import type { Perfil } from "../types/Perfil";

export interface DefinicionReporte<T> {
  titulo: string;
  nombreArchivo: string;
  columnas: ColumnaExportacion<T>[];
  // Textos del estado cuando no significa "Activo/Inactivo" (opcional)
  etiquetaActivo?: string;
  etiquetaInactivo?: string;
}

// El socio con su conteo de préstamos vigentes
export type SocioReporte = Socio & { totalPrestamos: number };

// El detalle no tiene campo estado en la base: activo = libro aún sin devolver
export type DetalleReporte = DetallePrestamo & { estado: boolean };

export const reporteLibros: DefinicionReporte<Libro> = {
  titulo: "Reporte de libros",
  nombreArchivo: "libros",
  columnas: [
    { encabezado: "Título", llavePropiedad: "titulo" },
    { encabezado: "Autor", llavePropiedad: "autor" },
    { encabezado: "ISBN", llavePropiedad: "isbn" },
    { encabezado: "Ejemplares disponibles", llavePropiedad: "ejemplaresDisponibles" },
  ],
};

export const reporteSocios: DefinicionReporte<SocioReporte> = {
  titulo: "Reporte de socios",
  nombreArchivo: "socios",
  columnas: [
    { encabezado: "Nombre", llavePropiedad: "nombre" },
    { encabezado: "Carnet", llavePropiedad: "carnet" },
    { encabezado: "Teléfono", llavePropiedad: "telefono" },
    { encabezado: "Préstamos", llavePropiedad: "totalPrestamos" },
  ],
};

export const reportePrestamos: DefinicionReporte<Prestamo> = {
  titulo: "Reporte de préstamos",
  nombreArchivo: "prestamos",
  columnas: [
    { encabezado: "Fecha de préstamo", llavePropiedad: "fechaPrestamo", formato: textoFecha },
    { encabezado: "Devolución esperada", llavePropiedad: "fechaDevolucionEsperada", formato: textoFecha },
    { encabezado: "Socio", llavePropiedad: "nombreSocio" },
    { encabezado: "Atendido por", llavePropiedad: "nombreUsuario" },
  ],
};

export const reporteDetallePrestamo: DefinicionReporte<DetalleReporte> = {
  titulo: "Reporte de detalle de préstamos",
  nombreArchivo: "detalle-prestamos",
  etiquetaActivo: "Pendiente",
  etiquetaInactivo: "Devuelto",
  columnas: [
    { encabezado: "Préstamo", llavePropiedad: "descripcionPrestamo" },
    { encabezado: "Socio", llavePropiedad: "nombreSocio" },
    { encabezado: "Libro", llavePropiedad: "nombreLibro" },
    {
      encabezado: "Devolución real",
      llavePropiedad: "fechaDevolucionReal",
      formato: (valor) => textoFecha(valor) || "Pendiente",
    },
  ],
};

export const reporteUsuarios: DefinicionReporte<Usuario> = {
  titulo: "Reporte de usuarios",
  nombreArchivo: "usuarios",
  columnas: [
    { encabezado: "Nombre", llavePropiedad: "nombre" },
    { encabezado: "Usuario", llavePropiedad: "usuario" },
    { encabezado: "Correo", llavePropiedad: "correo" },
    { encabezado: "Perfil", llavePropiedad: "nombrePerfil" },
  ],
};

export const reportePerfiles: DefinicionReporte<Perfil> = {
  titulo: "Reporte de perfiles",
  nombreArchivo: "perfiles",
  columnas: [{ encabezado: "Nombre del perfil", llavePropiedad: "nombre" }],
};