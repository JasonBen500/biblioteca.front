import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookMarked } from "lucide-react";
import type { LibroPedido } from "../../utils/estadisticas";

interface Props {
  datos: LibroPedido[];
}

// Colores de la paleta de index.css (recharts necesita valores directos)
const OCRE = "#c68a4c"; // accent-vintage
const GRIS_TEXTO = "#64748b"; // text-muted
const GRIS_LINEA = "#e2e8f0"; // border-light

const recortar = (texto: string) => (texto.length > 22 ? `${texto.slice(0, 21)}…` : texto);

function GraficaLibrosPedidos({ datos }: Props) {
  return (
    <section className="rounded-2xl border border-border-light bg-bg-surface p-5 font-marmelad shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-vintage/25 text-text-main">
          <BookMarked size={20} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-main">Libros más pedidos</h2>
          <p className="text-sm font-semibold text-text-muted">
            Veces que se ha prestado cada libro
          </p>
        </div>
      </div>

      {datos.length === 0 ? (
        <p className="rounded-xl border border-border-light p-6 text-center text-sm font-semibold text-text-muted">
          Aún no hay libros prestados.
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
                formatter={(valor) => [valor, "Pedidos"]}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${GRIS_LINEA}`,
                  fontWeight: 700,
                }}
              />
              <Bar dataKey="pedidos" fill={OCRE} radius={[0, 8, 8, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default GraficaLibrosPedidos;