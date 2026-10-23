import type { Key, ReactNode } from "react";

export interface ColumnaTabla<T> {
  encabezado: string;
  valor: (fila: T) => ReactNode;
}

interface Props<T> {
  columnas: ColumnaTabla<T>[];
  datos: T[];
  claveFila: (fila: T) => Key | null;
  acciones?: (fila: T) => ReactNode;
}

// Estilos en un solo lugar: si quieres cambiar el aspecto de todas las tablas, es aquí
const ESTILO_TH =
  "bg-text-main font-marmelad px-4 py-2 text-sm font-extrabold uppercase text-bg-main";
const ESTILO_TD = "font-marmelad font-semibold px-4 py-2 text-sm text-text-main";

function TablaDatos<T>({ columnas, datos, claveFila, acciones }: Props<T>) {
  const totalColumnas = columnas.length + (acciones ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-light shadow-sm">
      <table className="w-full border-collapse overflow-hidden bg-bg-surface">
        <thead>
          <tr className="border-b-4 border-bg-main">
            {columnas.map((col, index) => (
              <th
                key={index}
                className={`${ESTILO_TH} border-r border-bg-main text-left`}
              >
                {col.encabezado}
              </th>
            ))}
            {acciones && <th className={`${ESTILO_TH} text-center`}>Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td
                colSpan={totalColumnas}
                className={`${ESTILO_TD} py-6 text-center text-text-muted`}
              >
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            datos.map((fila, indice) => (
              <tr
                key={claveFila(fila) ?? indice}
                className="transition-colors odd:bg-bg-surface even:bg-bg-main hover:bg-accent-vintage/10"
              >
                {columnas.map((col, index) => (
                  <td key={index} className={`${ESTILO_TD} border-r border-border-light`}>
                    {col.valor(fila)}
                  </td>
                ))}
                {acciones && (
                  <td className={`${ESTILO_TD} text-center`}>{acciones(fila)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaDatos;