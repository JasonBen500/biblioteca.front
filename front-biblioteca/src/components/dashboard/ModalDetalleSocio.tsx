import { useEffect, useMemo, useState } from "react";
import { IdCard, Phone, Printer } from "lucide-react";
import Modal from "../Modal";
import Mensaje from "../Mensaje";
import { getDetallePrestamo } from "../../services/detallePrestamoService";
import { comprobanteSocio, type HistorialPrestamo } from "../../utils/tickets";
import { formatearFecha } from "../../utils/fechas";
import type { Socio } from "../../types/Socio";
import type { Prestamo } from "../../types/Prestamo";
import type { DetallePrestamo } from "../../types/DetallePrestamo";

interface Props {
    socio: Socio | null;
    prestamos: Prestamo[];
    onCerrar: () => void;
}

interface PropsContenido {
    socio: Socio;
    prestamos: Prestamo[];
}

const estaPendiente = (d: DetallePrestamo) => d.estado || !d.fechaDevolucionReal;

function ContenidoDetalle({ socio, prestamos }: PropsContenido) {
    const [detalles, setDetalles] = useState<DetallePrestamo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;
        getDetallePrestamo()
            .then((res) => {
                if (activo) setDetalles(res.data);
            })
            .catch(() => {
                if (activo) setError("Error: no se pudo cargar el historial del socio.");
            })
            .finally(() => {
                if (activo) setCargando(false);
            });
        return () => {
            activo = false;
        };
    }, []);

    const historial = useMemo<HistorialPrestamo[]>(
        () =>
            prestamos
                .filter((p) => p.idSocio === socio.idSocio)
                .sort((a, b) => b.fechaPrestamo.localeCompare(a.fechaPrestamo))
                .map((prestamo) => ({
                    prestamo,
                    detalles: detalles.filter((d) => d.idPrestamo === prestamo.idPrestamo),
                })),
        [prestamos, detalles, socio.idSocio],
    );

    return (
        <div className="flex flex-col gap-5 font-marmelad">
            <Mensaje texto={error} />

            <section className="grid gap-2 rounded-2xl border border-border-light bg-bg-main p-4 text-sm font-semibold text-text-main sm:grid-cols-2">
                <p className="sm:col-span-2 text-base font-extrabold">{socio.nombre}</p>
                <p className="flex items-center gap-2 text-text-muted">
                    <IdCard size={16} />
                    Carnet: {socio.carnet || "—"}
                </p>
                <p className="flex items-center gap-2 text-text-muted">
                    <Phone size={16} />
                    {socio.telefono || "—"}
                </p>
                <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${socio.estado
                            ? "bg-accent-modern/10 text-accent-modern"
                            : "bg-text-muted/15 text-text-muted"
                        }`}
                >
                    {socio.estado ? "Activo" : "Inactivo"}
                </span>
            </section>

            <section>
                <h3 className="mb-2 text-base font-extrabold text-text-main">
                    Historial de préstamos ({historial.length})
                </h3>

                {cargando ? (
                    <p className="text-sm font-semibold text-text-muted">Cargando...</p>
                ) : historial.length === 0 ? (
                    <p className="rounded-xl border border-border-light p-4 text-center text-sm font-semibold text-text-muted">
                        Este socio aún no tiene préstamos.
                    </p>
                ) : (
                    <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                        {historial.map(({ prestamo, detalles: libros }) => (
                            <article
                                key={prestamo.idPrestamo}
                                className="rounded-2xl border border-border-light bg-bg-surface p-3"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-extrabold text-text-main">
                                        Préstamo #{prestamo.idPrestamo}
                                    </p>
                                    <p className="text-xs font-bold text-text-muted">
                                        {formatearFecha(prestamo.fechaPrestamo)} → {formatearFecha(prestamo.fechaDevolucionEsperada)}
                                    </p>
                                </div>

                                <ul className="mt-2 flex flex-col gap-1">
                                    {libros.length === 0 ? (
                                        <li className="text-xs font-semibold text-text-muted">Sin libros</li>
                                    ) : (
                                        libros.map((d) => (
                                            <li
                                                key={d.idDetallePrestamo}
                                                className="flex items-center justify-between gap-2 text-xs font-semibold text-text-main"
                                            >
                                                <span className="truncate">{d.nombreLibro ?? `Libro #${d.idLibro}`}</span>
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 font-extrabold ${estaPendiente(d)
                                                            ? "bg-alert/20 text-text-main"
                                                            : "bg-accent-modern/10 text-accent-modern"
                                                        }`}
                                                >
                                                    {estaPendiente(d)
                                                        ? "Pendiente"
                                                        : `Devuelto ${formatearFecha(d.fechaDevolucionReal)}`}
                                                </span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={cargando}
                    onClick={() => comprobanteSocio(socio, historial)}
                    className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    <Printer size={16} />
                    Imprimir
                </button>
            </div>
        </div>
    );
}

function ModalDetalleSocio({ socio, prestamos, onCerrar }: Props) {
    return (
        <Modal
            abierto={socio !== null}
            titulo="Detalles del socio"
            subtitulo="Datos e historial de préstamos"
            icono={IdCard}
            onCerrar={onCerrar}
        >
            {socio && <ContenidoDetalle socio={socio} prestamos={prestamos} />}
        </Modal>
    );
}

export default ModalDetalleSocio;