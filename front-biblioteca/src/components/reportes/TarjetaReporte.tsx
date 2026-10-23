import type { LucideIcon } from "lucide-react";
import BotonesExportar from "../BotonesExportar";
import type { ColumnaExportacion } from "../../utils/exportar";
import { filtrarPorEstado, type FiltroEstado } from "../../utils/estados";
import type { DefinicionReporte } from "../../utils/reportes";

interface Props<T extends { estado: boolean }> {
  nombre: string;
  icono: LucideIcon;
  reporte: DefinicionReporte<T>;
  registros: T[];
  filtro: FiltroEstado;
  cargando: boolean;
  error: boolean;
  ficha: string;
  descripcion: string;
}

function TarjetaReporte<T extends { estado: boolean }>({
  nombre,
  icono: Icono,
  reporte,
  registros,
  filtro,
  cargando,
  error,
}: Props<T>) {
  const seleccionados = filtrarPorEstado(registros, filtro);
  const activos = registros.filter((r) => r.estado).length;
  const inactivos = registros.length - activos;

  // Algunos reportes (detalle de préstamos) usan otras palabras: Pendiente / Devuelto
  const etiquetaActivo = reporte.etiquetaActivo ?? "Activo";
  const etiquetaInactivo = reporte.etiquetaInactivo ?? "Inactivo";

  // Con "todos" se agrega una columna para distinguir un estado del otro
  const columnas: ColumnaExportacion<T>[] =
    filtro === "todos"
      ? [
          ...reporte.columnas,
          {
            encabezado: "Estado",
            llavePropiedad: "estado",
            formato: (valor) => (valor ? etiquetaActivo : etiquetaInactivo),
          },
        ]
      : reporte.columnas;

  const palabra = (etiqueta: string, cantidad: number) =>
    `${etiqueta.toLowerCase()}${cantidad === 1 ? "" : "s"}`;

  const contador = cargando ? "…" : error ? "—" : seleccionados.length;
  const desglose =
    cargando || error
      ? ""
      : `${activos} ${palabra(etiquetaActivo, activos)} · ${inactivos} ${palabra(
          etiquetaInactivo,
          inactivos,
        )}`;

  return (
    <article className="flex flex-col justify-between gap-5 rounded-2xl border border-border-light bg-bg-surface p-6 font-marmelad shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-vintage/25 text-text-main">
          <Icono size={24} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-main">{nombre}</h2>
          <p className="text-sm font-semibold text-text-muted">
            <span className="text-2xl font-extrabold text-text-main">{contador}</span>{" "}
            {seleccionados.length === 1 ? "registro" : "registros"}
          </p>
          <p className="text-xs font-semibold text-text-muted">{desglose}</p>
        </div>
      </div>

      <BotonesExportar
        titulo={`${reporte.titulo} (${filtro})`}
        nombreArchivo={`${reporte.nombreArchivo}-${filtro}`}
        columnas={columnas}
        datos={seleccionados}
        deshabilitado={cargando || error}
      />
    </article>
  );
}

export default TarjetaReporte;