import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PrestamosPorDia } from "../../utils/estadisticas";

interface Props {
  datos: PrestamosPorDia[];
}

// Colores de la paleta de index.css (recharts necesita valores directos)
const AZUL = "#2563eb"; // accent-modern
const OCRE = "#c68a4c"; // accent-vintage
const GRIS_TEXTO = "#64748b"; // text-muted
const GRIS_LINEA = "#e2e8f0"; // border-light

function GraficaPrestamosSemana({ datos }: Props) {
  const total = datos.reduce((suma, d) => suma + d.prestamos, 0);
  const hoy = new Date();
  const diaHoy = (hoy.getDay() + 6) % 7; // lunes = 0 ... domingo = 6

  return (
    <section className="rounded-2xl border border-border-light bg-bg-surface p-5 font-marmelad shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-text-main">
            Préstamos por día de la semana
          </h2>
          <p className="text-sm font-semibold text-text-muted">
            Semana actual, de lunes a domingo
          </p>
        </div>
        <span className="rounded-full bg-text-main px-3 py-1 text-xs font-extrabold text-bg-main">
          {total} {total === 1 ? "préstamo" : "préstamos"}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRIS_LINEA} vertical={false} />
            <XAxis
              dataKey="dia"
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
              formatter={(valor) => [valor, "Préstamos"]}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${GRIS_LINEA}`,
                fontWeight: 700,
              }}
            />
            <Bar
              dataKey="prestamos"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
              shape={(props: {
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                index?: number;
              }) => {
                const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
                // El día de hoy se resalta en azul; los demás en ocre
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={8}
                    ry={8}
                    fill={index === diaHoy ? AZUL : OCRE}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default GraficaPrestamosSemana;