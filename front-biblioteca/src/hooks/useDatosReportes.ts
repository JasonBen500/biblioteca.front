import { useEffect, useState } from "react";
import { getLibros } from "../services/librosService";
import { getSocios } from "../services/sociosSsrvice";
import { getPrestamos } from "../services/prestamosService";
import { getDetallePrestamo } from "../services/detallePrestamoService";
import { getUsuarios } from "../services/usuariosService";
import { getPerfiles } from "../services/perfilesservices";
import { contarPrestamosPorSocio } from "../utils/estadisticas";
import type { DetalleReporte, SocioReporte } from "../utils/reportes";
import type { Libro } from "../types/Libro";
import type { Prestamo } from "../types/Prestamo";
import type { Usuario } from "../types/Usuario";
import type { Perfil } from "../types/Perfil";

// Carga todos los datos que usan los reportes, ya listos para exportar
export function useDatosReportes() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [socios, setSocios] = useState<SocioReporte[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [detalles, setDetalles] = useState<DetalleReporte[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [
          resLibros,
          resSocios,
          resPrestamos,
          resDetalles,
          resUsuarios,
          resPerfiles,
        ] = await Promise.all([
          getLibros(),
          getSocios(),
          getPrestamos(),
          getDetallePrestamo(),
          getUsuarios(),
          getPerfiles(),
        ]);

        const conteo = contarPrestamosPorSocio(resPrestamos.data);

        setLibros(resLibros.data);
        setSocios(
          resSocios.data.map((s) => ({
            ...s,
            totalPrestamos: conteo.get(s.idSocio) ?? 0,
          })),
        );
        setPrestamos(resPrestamos.data);
        setDetalles(resDetalles.data);
        setUsuarios(resUsuarios.data);
        setPerfiles(resPerfiles.data);
      } catch {
        setError("Error: no se pudieron cargar los datos de los reportes.");
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, []);

  return { libros, socios, prestamos, detalles, usuarios, perfiles, cargando, error };
}