// Escapa texto para insertarlo dentro de HTML sin riesgos
export const esc = (texto: unknown) =>
    String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const ESTILOS_BASE = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 16px; font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; font-size: 12px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 16px 0 6px; }
  p { margin: 2px 0; }
  .muted { color: #64748b; }
  .centro { text-align: center; }
  .linea { border-top: 1px dashed #64748b; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
  th { background: #1e293b; color: #f4f6f8; }
  .pendiente { color: #d97706; font-weight: bold; }
`;

interface OpcionesImpresion {
    titulo: string;
    cuerpo: string; // HTML con el texto dinámico ya escapado con esc()
    estilos?: string; // estilos extra (por ejemplo, el ancho de un ticket)
}

// Imprime un HTML en un iframe oculto (así no lo bloquea el navegador como ventana emergente)
export function imprimirHTML({ titulo, cuerpo, estilos = "" }: OpcionesImpresion): void {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const ventana = iframe.contentWindow;
    const doc = ventana?.document;
    if (!ventana || !doc) {
        iframe.remove();
        return;
    }

    doc.open();
    doc.write(
        `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${esc(
            titulo,
        )}</title><style>${ESTILOS_BASE}${estilos}</style></head><body>${cuerpo}</body></html>`,
    );
    doc.close();

    const limpiar = () => iframe.remove();
    ventana.onafterprint = limpiar;
    setTimeout(limpiar, 60000);

    // Un momento para que se pinte el contenido antes de abrir el diálogo de impresión
    setTimeout(() => {
        ventana.focus();
        ventana.print();
    }, 250);
}