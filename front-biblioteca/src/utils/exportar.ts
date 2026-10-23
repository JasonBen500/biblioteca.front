import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatearFecha, hoyTexto } from "./fechas";
import logoUrl from "../assets/images/LogoSimple.png";

// Una columna del reporte
export interface ColumnaExportacion<T> {
  encabezado: string;
  llavePropiedad: keyof T;
  // Opcional: transforma el valor antes de exportarlo (fechas, estados, etc.)
  formato?: (valor: unknown, fila: T) => string | number;
}

// Configuración visual del reporte
export interface ConfiguracionReporte {
  tituloPrincipal: string;
  nombreEmpresa?: string; // si no se envía, usa EMPRESA_POR_DEFECTO
  fecha?: string; // "dd/mm/aaaa"; si no se envía, usa la de hoy
  nombreArchivo?: string;
  accionPdf?: "descargar" | "abrir";
  logo?: string;
}

const EMPRESA_POR_DEFECTO = "Bibliotech";
const LEMA = "Sistemas que organizan conocimiento";
const COLOR_PRINCIPAL: [number, number, number] = [30, 41, 59]; // text-main (#1e293b)
const COLOR_OCRE: [number, number, number] = [198, 138, 76]; // accent-vintage (#c68a4c)
const COLOR_FILA_ALTERNA: [number, number, number] = [251, 247, 238]; // papel (#fbf7ee)

// Proporción del logo (ancho / alto) para no deformarlo en el PDF
const RELACION_LOGO = 1247 / 882;

// El logo se convierte una sola vez a base64, que es lo que jsPDF necesita
let logoCache: Promise<string> | null = null;

const cargarLogo = (): Promise<string> => {
  if (!logoCache) {
    logoCache = fetch(logoUrl)
      .then((respuesta) => respuesta.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const lector = new FileReader();
            lector.onload = () => resolve(String(lector.result));
            lector.onerror = () => reject(lector.error);
            lector.readAsDataURL(blob);
          }),
      );
  }
  return logoCache;
};

// Se precarga al iniciar para que el PDF salga al instante
cargarLogo().catch(() => {
  logoCache = null;
});

// Formato listo para columnas de fecha: "2026-10-20T00:00..." -> "20 oct 2026"
export const textoFecha = (valor: unknown) =>
  typeof valor === "string" && valor.length >= 10
    ? formatearFecha(valor)
    : "";

// "2026-10-15" -> "15/10/2026"
const fechaDeHoy = () => {
  const [anio, mes, dia] = hoyTexto().split("-");
  return `${dia}/${mes}/${anio}`;
};

// Valor final de una celda: aplica el formato de la columna o uno por defecto
function obtenerValor<T>(
  fila: T,
  columna: ColumnaExportacion<T>,
): string | number {
  const bruto = fila[columna.llavePropiedad];
  if (columna.formato) return columna.formato(bruto, fila);
  if (bruto === null || bruto === undefined) return "";
  if (typeof bruto === "number" || typeof bruto === "string") return bruto;
  if (typeof bruto === "boolean") return bruto ? "Sí" : "No";
  return String(bruto);
}

function armarFilas<T>(
  columnas: ColumnaExportacion<T>[],
  datos: T[],
): (string | number)[][] {
  return datos.map((fila) => columnas.map((col) => obtenerValor(fila, col)));
}

/**
 * EXPORTAR A PDF
 */
export async function exportarTablaPDF<T>(
  config: ConfiguracionReporte,
  columnas: ColumnaExportacion<T>[],
  datos: T[],
): Promise<void> {
  const accion = config.accionPdf ?? "descargar";
  const nombreArchivo = config.nombreArchivo ?? "reporte";

  // La pestaña se abre antes de preparar el logo para que el navegador no la bloquee
  const ventana = accion === "abrir" ? window.open("", "_blank") : null;
  const logo = config.logo ?? (await cargarLogo().catch(() => ""));

  const doc = new jsPDF();
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();

  // Banda de encabezado con línea ocre
  doc.setFillColor(...COLOR_PRINCIPAL);
  doc.rect(0, 0, anchoPagina, 36, "F");
  doc.setFillColor(...COLOR_OCRE);
  doc.rect(0, 36, anchoPagina, 1.5, "F");

  let posicionXTexto = 14;
  if (logo) {
    const alto = 26;
    const ancho = alto * RELACION_LOGO;
    doc.addImage(logo, "PNG", 10, 5, ancho, alto);
    posicionXTexto = 10 + ancho + 6;
  }

  // Empresa, título y lema
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(config.nombreEmpresa ?? EMPRESA_POR_DEFECTO, posicionXTexto, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(226, 232, 240);
  doc.text(config.tituloPrincipal, posicionXTexto, 23);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_OCRE);
  doc.text(LEMA, posicionXTexto, 30);

  // Fecha de emisión a la derecha
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text(`Fecha de emisión: ${config.fecha ?? fechaDeHoy()}`, anchoPagina - 14, 15, {
    align: "right",
  });

  if (datos.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("No hay registros para mostrar.", 14, 48);
  } else {
    autoTable(doc, {
      head: [columnas.map((col) => col.encabezado)],
      body: armarFilas(columnas, datos),
      startY: 44,
      margin: { left: 14, right: 14, bottom: 18 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: COLOR_PRINCIPAL, textColor: 255 },
      alternateRowStyles: { fillColor: COLOR_FILA_ALTERNA },
    });
  }

  // Pie de página en todas las hojas: lema y numeración
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR_OCRE);
    doc.setLineWidth(0.6);
    doc.line(14, altoPagina - 14, anchoPagina - 14, altoPagina - 14);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(LEMA, 14, altoPagina - 9);

    doc.setFont("helvetica", "normal");
    doc.text(`Página ${i} de ${totalPaginas}`, anchoPagina - 14, altoPagina - 9, {
      align: "right",
    });
  }

  if (accion === "descargar") {
    doc.save(`${nombreArchivo}.pdf`);
  } else {
    const url = URL.createObjectURL(doc.output("blob"));
    if (ventana) ventana.location.href = url;
    else window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

/**
 * EXPORTAR A EXCEL
 */
export function exportarTablaExcel<T>(
  config: ConfiguracionReporte,
  columnas: ColumnaExportacion<T>[],
  datos: T[],
): void {
  const nombreArchivo = config.nombreArchivo ?? "reporte";
  const empresa = config.nombreEmpresa ?? EMPRESA_POR_DEFECTO;
  const encabezados = columnas.map((col) => col.encabezado);
  const filas = armarFilas(columnas, datos);

  // Fila 1: título, fila 2: en blanco, fila 3: encabezados, luego los datos
  // (así, aunque no haya registros, el archivo conserva sus encabezados)
  const hoja = XLSX.utils.aoa_to_sheet([
    [`${empresa} - ${config.tituloPrincipal}`],
    [],
    encabezados,
    ...filas,
  ]);

  // Ancho de cada columna según su contenido más largo (máximo 40)
  hoja["!cols"] = encabezados.map((encabezado, i) => {
    const largo = filas.reduce(
      (max, fila) => Math.max(max, String(fila[i]).length),
      encabezado.length,
    );
    return { wch: Math.min(40, largo + 2) };
  });

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Datos");
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}