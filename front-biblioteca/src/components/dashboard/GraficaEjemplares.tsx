import { useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Library } from "lucide-react";
import { librosPorEjemplares } from "../../utils/estadisticas";
import type { Libro } from "../../types/Libro";

interface Props {
    libros: Libro[];
}

// Colores de la paleta de index.css (recharts necesita valores directos)
const AZUL = "#2563eb"; // accent-modern
const AMBAR = "#d97706"; // alert
const GRIS_TEXTO = "#64748b"; // text-muted
const GRIS_LINEA = "#e2e8f0"; // border-light

const recortar = (texto: string) => (texto.length > 22 ? `${texto.slice(0, 21)}…` : texto);

const estiloBoton = (activo: boolean) =>
    `rounded-full px-4 py-2 font-marmelad text-xs font-extrabold transition-colors ${activo
        ? "bg-text-main text-bg-main"
        : "border border-border-light bg-bg-surface text-text-main hover:bg-bg-main"
    }`;

function GraficaEjemplares({ libros }: Props) {
    const [orden, setOrden] = useState<"mas" | "menos">("mas");

    const datos = useMemo(() => librosPorEjemplares(libros, orden, 5), [libros, orden]);

    return (
        <section className="rounded-2xl border border-border-light bg-bg-surface p-5 font-marmelad shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-vintage/25 text-text-main">
                        <Library size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-text-main">Ejemplares disponibles</h2>
                        <p className="text-sm font-semibold text-text-muted">
                            {orden === "mas" ? "Libros con más ejemplares" : "Libros con menos ejemplares"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={() => setOrden("mas")} className={estiloBoton(orden === "mas")}>
                        Más ejemplares
                    </button>
                    <button type="button" onClick={() => setOrden("menos")} className={estiloBoton(orden === "menos")}>
                        Menos ejemplares
                    </button>
                </div>
            </div>

            {datos.length === 0 ? (
                <p className="rounded-xl border border-border-light p-6 text-center text-sm font-semibold text-text-muted">
                    No hay libros para mostrar.
                </p>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={datos}
                            layout="vertical"
                            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={GRIS_LINEA} horizontal={false} />
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                tick={{ fill: GRIS_TEXTO, fontSize: 12, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="titulo"
                                width={130}
                                tickFormatter={recortar}
                                tick={{ fill: GRIS_TEXTO, fontSize: 12, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(198, 138, 76, 0.12)" }}
                                formatter={(valor) => [valor, "Ejemplares"]}
                                contentStyle={{
                                    borderRadius: 12,
                                    border: `1px solid ${GRIS_LINEA}`,
                                    fontWeight: 700,
                                }}
                            />
                            <Bar
                                dataKey="ejemplares"
                                fill={orden === "mas" ? AZUL : AMBAR}
                                radius={[0, 8, 8, 0]}
                                maxBarSize={28}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

export default GraficaEjemplares;