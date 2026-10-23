import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    NOMBRES_MESES,
    formatearFecha,
    hoyTexto,
    soloFecha,
} from "../utils/fechas";

export interface EventoCalendario<T = unknown> {
    id: string | number;
    fecha: string; // "AAAA-MM-DD" (se aceptan fechas con hora)
    titulo: string;
    detalle?: string;
    datos?: T; // el objeto original, por si la acción lo necesita
}

interface Props<T> {
    eventos: EventoCalendario<T>[];
    // Color del contador de cada día 
    claseBadge?: string;
    textoVacio?: string;
    // Botón opcional junto a cada evento de la lista (p
    renderAccion?: (evento: EventoCalendario<T>) => ReactNode;
}

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const aTexto = (anio: number, mes: number, dia: number) =>
    `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

function CalendarioMensual<T>({
    eventos,
    claseBadge = "bg-accent-modern text-white",
    textoVacio = "No hay registros en este día.",
    renderAccion,
}: Props<T>) {
    const hoy = hoyTexto();
    const [anio, setAnio] = useState(Number(hoy.slice(0, 4)));
    const [mes, setMes] = useState(Number(hoy.slice(5, 7)) - 1);
    const [seleccion, setSeleccion] = useState(hoy);

    // Eventos agrupados por día
    const porDia = useMemo(() => {
        const mapa = new Map<string, EventoCalendario<T>[]>();
        eventos.forEach((evento) => {
            if (!evento.fecha) return;
            const clave = soloFecha(evento.fecha);
            mapa.set(clave, [...(mapa.get(clave) ?? []), evento]);
        });
        return mapa;
    }, [eventos]);

    // Casillas del mes: huecos antes del día 1 (la semana empieza en lunes) y los días
    const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7;
    const diasDelMes = new Date(anio, mes + 1, 0).getDate();
    const casillas: (number | null)[] = [
        ...Array.from({ length: primerDia }, () => null),
        ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
    ];

    const totalDelMes = Array.from(porDia.entries())
        .filter(([fecha]) => fecha.startsWith(aTexto(anio, mes, 1).slice(0, 7)))
        .reduce((suma, [, lista]) => suma + lista.length, 0);

    const cambiarMes = (cambio: number) => {
        const nueva = new Date(anio, mes + cambio, 1);
        setAnio(nueva.getFullYear());
        setMes(nueva.getMonth());
    };

    const irAHoy = () => {
        setAnio(Number(hoy.slice(0, 4)));
        setMes(Number(hoy.slice(5, 7)) - 1);
        setSeleccion(hoy);
    };

    const eventosDelDia = porDia.get(seleccion) ?? [];

    return (
        <section className="rounded-2xl border border-border-light bg-bg-surface p-5 font-marmelad shadow-sm">
            {/* Encabezado del mes */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => cambiarMes(-1)}
                        aria-label="Mes anterior"
                        className="rounded-lg p-2 text-text-main transition-colors hover:bg-text-main/10"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="min-w-44 text-center text-lg font-extrabold text-text-main">
                        {NOMBRES_MESES[mes]} {anio}
                    </h2>
                    <button
                        type="button"
                        onClick={() => cambiarMes(1)}
                        aria-label="Mes siguiente"
                        className="rounded-lg p-2 text-text-main transition-colors hover:bg-text-main/10"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-text-main px-3 py-1 text-xs font-extrabold text-bg-main">
                        {totalDelMes} {totalDelMes === 1 ? "registro" : "registros"} este mes
                    </span>
                    <button
                        type="button"
                        onClick={irAHoy}
                        className="rounded-full border border-text-main px-4 py-1 text-xs font-bold text-text-main transition-colors hover:bg-text-main hover:text-white"
                    >
                        Hoy
                    </button>
                </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 pb-1">
                {DIAS_SEMANA.map((dia) => (
                    <div
                        key={dia}
                        className="text-center text-xs font-extrabold uppercase text-text-muted"
                    >
                        {dia}
                    </div>
                ))}
            </div>

            {/* Casillas */}
            <div className="grid grid-cols-7 gap-1">
                {casillas.map((dia, indice) => {
                    if (dia === null) return <div key={`hueco-${indice}`} />;

                    const fecha = aTexto(anio, mes, dia);
                    const cantidad = porDia.get(fecha)?.length ?? 0;
                    const esHoy = fecha === hoy;
                    const elegido = fecha === seleccion;

                    return (
                        <button
                            key={fecha}
                            type="button"
                            onClick={() => setSeleccion(fecha)}
                            aria-label={`${dia} de ${NOMBRES_MESES[mes]}: ${cantidad} registros`}
                            aria-pressed={elegido}
                            className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-sm font-bold transition-colors ${elegido
                                    ? "border-text-main bg-text-main text-bg-main"
                                    : cantidad > 0
                                        ? "border-accent-vintage/40 bg-accent-vintage/15 text-text-main hover:bg-accent-vintage/25"
                                        : "border-border-light text-text-main hover:bg-bg-main"
                                } ${esHoy && !elegido ? "ring-2 ring-accent-modern" : ""}`}
                        >
                            <span>{dia}</span>
                            {cantidad > 0 && (
                                <span
                                    className={`min-w-5 rounded-full px-1.5 text-[11px] font-extrabold ${claseBadge}`}
                                >
                                    {cantidad}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Lista del día seleccionado */}
            <div className="mt-5 border-t border-border-light pt-4">
                <h3 className="mb-2 text-sm font-extrabold text-text-main">
                    {formatearFecha(seleccion)}
                </h3>

                {eventosDelDia.length === 0 ? (
                    <p className="text-sm font-semibold text-text-muted">{textoVacio}</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {eventosDelDia.map((evento) => (
                            <li
                                key={evento.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border-light bg-bg-main px-4 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-extrabold text-text-main">
                                        {evento.titulo}
                                    </p>
                                    {evento.detalle && (
                                        <p className="truncate text-xs font-semibold text-text-muted">
                                            {evento.detalle}
                                        </p>
                                    )}
                                </div>
                                {renderAccion?.(evento)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default CalendarioMensual;