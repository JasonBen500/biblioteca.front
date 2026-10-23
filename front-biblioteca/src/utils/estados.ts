export type FiltroEstado = "activos" | "inactivos" | "todos";

// Filtra una lista según el estado de sus registros (activo = true, anulado = false)
export function filtrarPorEstado<T extends { estado: boolean }>(
  registros: T[],
  filtro: FiltroEstado,
): T[] {
  if (filtro === "activos") return registros.filter((r) => r.estado);
  if (filtro === "inactivos") return registros.filter((r) => !r.estado);
  return registros;
}