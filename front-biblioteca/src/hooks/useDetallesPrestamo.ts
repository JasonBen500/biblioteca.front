import { useEffect, useState } from "react";
import { getDetallePrestamo } from "../services/detallePrestamoService";
import type { DetallePrestamo } from "../types/DetallePrestamo";

// Carga todos los detalles de préstamo (libro por libro) para las gráficas
export function useDetallesPrestamo() {
    const [detalles, setDetalles] = useState<DetallePrestamo[]>([]);

    useEffect(() => {
        let activo = true;
        getDetallePrestamo()
            .then((res) => {
                if (activo) setDetalles(res.data);
            })
            .catch(() => {
                if (activo) setDetalles([]);
            });
        return () => {
            activo = false;
        };
    }, []);

    return detalles;
}