export const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Del texto que manda el servidor se queda con "AAAA-MM-DD"
export const soloFecha = (fecha: string) => fecha.slice(0, 10);

// Date -> "AAAA-MM-DD" con la fecha local (no la UTC)
export const fechaATexto = (fecha: Date) => {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

// Fecha de hoy en la zona horaria del navegador, como "AAAA-MM-DD"
export const hoyTexto = () => fechaATexto(new Date());

// "2026-10-20..." -> "20 oct 2026" (vacío si no hay fecha)
export const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return "—";
  const [anio, mes, dia] = soloFecha(fecha).split("-");
  const nombreMes = NOMBRES_MESES[Number(mes) - 1]?.slice(0, 3).toLowerCase();
  if (!nombreMes) return "—";
  return `${Number(dia)} ${nombreMes} ${anio}`;
};