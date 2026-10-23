import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Users } from "lucide-react";
import type { ComparacionSocio } from "../../utils/estadisticas";

interface Props {
    datos: ComparacionSocio[];
}

// Colores de la paleta de index.css (recharts necesita valores directos)
const AZUL = "#2563eb"; // accent-modern
const OCRE = "#c68a4c"; // accent-vintage
const AMBAR = "#d97706"; // alert
const GRIS_TEXTO = "#64748b"; // text-muted
const GRIS_LINEA = "#e2e8f0"; // border-light

const recortar = (texto: string) => (texto.length > 10 ? `${texto.slice(0, 9)}…` : texto);

function GraficaSociosActivos({ datos }: Props) {
    return (
        <section className="rounded-2xl border border-border-light bg-bg-surface p-5 font-marmelad shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-vintage/25 text-text-main">
                    <Users size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-extrabold text-text-main">
                        Comparación de los socios más activos
                    </h2>
                    <p className="text-sm font-semibold text-text-muted">
                        Préstamos, libros prestados y libros pendientes de devolver
                    </p>
                </div>
            </div>

            {datos.length === 0 ? (
                <p className="rounded-xl border border-border-light p-6 text-center text-sm font-semibold text-text-muted">
                    Aún no hay préstamos para comparar.
                </p>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datos} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRIS_LINEA} vertical={false} />
                            <XAxis
                                dataKey="nombre"
                                tickFormatter={recortar}
                                tick={{ fill: GRIS_TEXTO, fontSize: 12, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: GRIS_TEXTO, fontSize: 12, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(198, 138, 76, 0.12)" }}
                                contentStyle={{
                                    borderRadius: 12,
                                    border: `1px solid ${GRIS_LINEA}`,
                                    fontWeight: 700,
                                }}
                            />
                            <Legend wrapperStyle={{ fontWeight: 700, fontSize: 12 }} />
                            <Bar dataKey="prestamos" name="Préstamos" fill={AZUL} radius={[6, 6, 0, 0]} maxBarSize={28} />
                            <Bar dataKey="libros" name="Libros prestados" fill={OCRE} radius={[6, 6, 0, 0]} maxBarSize={28} />
                            <Bar dataKey="pendientes" name="Pendientes" fill={AMBAR} radius={[6, 6, 0, 0]} maxBarSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

export default GraficaSociosActivos;