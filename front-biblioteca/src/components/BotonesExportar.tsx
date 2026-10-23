import { useState } from "react";
import { Eye, FileSpreadsheet, FileText } from "lucide-react";
import {
  exportarTablaExcel,
  exportarTablaPDF,
  type ColumnaExportacion,
} from "../utils/exportar";

interface Props<T> {
  deshabilitado?: boolean;
  titulo: string;
  nombreArchivo: string;
  columnas: ColumnaExportacion<T>[];
  datos: T[];
}

const OPCIONES_CANTIDAD = [5, 10, 20, 50, 100];

const estiloBoton =
  "inline-flex items-center gap-1.5 rounded-full border border-text-main px-4 py-2 font-marmelad text-xs font-bold text-text-main transition-colors hover:bg-text-main hover:text-white disabled:pointer-events-none disabled:opacity-40";

function BotonesExportar<T>({
  titulo,
  nombreArchivo,
  columnas,
  datos,
  deshabilitado = false,
}: Props<T>) {
  const [cantidad, setCantidad] = useState("todos");
  const config = { tituloPrincipal: titulo, nombreArchivo };

  // Solo el PDF se limita; Excel siempre lleva todos los registros
  const datosPdf = cantidad === "todos" ? datos : datos.slice(0, Number(cantidad));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="inline-flex items-center gap-2 font-marmelad text-xs font-extrabold text-text-main">
        Registros en PDF
        <select
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          disabled={deshabilitado}
          className="rounded-full border border-text-main bg-bg-surface px-3 py-2 font-marmelad text-xs font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-accent-vintage disabled:opacity-40"
        >
          <option value="todos">Todos ({datos.length})</option>
          {OPCIONES_CANTIDAD.map((n) => (
            <option key={n} value={n}>
              Primeros {n}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        disabled={deshabilitado}
        onClick={() =>
          exportarTablaPDF({ ...config, accionPdf: "descargar" }, columnas, datosPdf)
        }
        className={estiloBoton}
      >
        <FileText size={14} />
        PDF
      </button>

      <button
        type="button"
        disabled={deshabilitado}
        onClick={() => exportarTablaExcel(config, columnas, datos)}
        className={estiloBoton}
      >
        <FileSpreadsheet size={14} />
        Excel
      </button>

      <button
        type="button"
        disabled={deshabilitado}
        onClick={() =>
          exportarTablaPDF({ ...config, accionPdf: "abrir" }, columnas, datosPdf)
        }
        className={estiloBoton}
      >
        <Eye size={14} />
        Ver PDF
      </button>
    </div>
  );
}

export default BotonesExportar;