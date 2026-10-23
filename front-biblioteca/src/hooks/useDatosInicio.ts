import { useCallback, useEffect, useState } from "react";
import { getLibros } from "../services/librosService";
import { getSocios } from "../services/sociosSsrvice";
import { getPrestamos } from "../services/prestamosService";
import type { Libro } from "../types/Libro";
import type { Socio } from "../types/Socio";
import type { Prestamo } from "../types/Prestamo";

// Carga todo lo que necesitan la página principal y las páginas de libros y socios
export function useDatosInicio() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = useCallback(async () => {
    try {
      const [resLibros, resSocios, resPrestamos] = await Promise.all([
        getLibros(),
        getSocios(),
        getPrestamos(),
      ]);
      setLibros(resLibros.data);
      setSocios(resSocios.data);
      setPrestamos(resPrestamos.data);
      setError("");
    } catch {
      setError("Error: no se pudieron cargar los datos del servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { libros, socios, prestamos, cargando, error, recargar };
}