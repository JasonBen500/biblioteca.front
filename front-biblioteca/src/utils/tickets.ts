import type { Prestamo } from "../types/Prestamo";
import type { DetallePrestamo } from "../types/DetallePrestamo";
import type { Socio } from "../types/Socio";
import { esc, imprimirHTML } from "./imprimir";
import { formatearFecha, hoyTexto } from "./fechas";

export interface HistorialPrestamo {
    prestamo: Prestamo;
    detalles: DetallePrestamo[];
}

const estaPendiente = (d: DetallePrestamo) => d.estado || !d.fechaDevolucionReal;

const textoDevolucion = (d: DetallePrestamo) =>
    estaPendiente(d) ? "Pendiente" : formatearFecha(d.fechaDevolucionReal);

export const ticketPrestamo = (prestamo: Prestamo, detalles: DetallePrestamo[]) => {
    const libros = detalles
        .map(
            (d) => `
      <div class="libro">
        <div>${esc(d.nombreLibro ?? `Libro #${d.idLibro}`)}</div>
        <div class="${estaPendiente(d) ? "pendiente" : "muted"}">
          Devuelto: ${esc(textoDevolucion(d))}
        </div>
      </div>`
        )
        .join("");

    const cuerpo = `
    <div class="ticket">
      <h2 class="centro">BIBLIOTECH</h2>
      <div class="centro muted">Ticket de préstamo</div>
      <div class="linea"></div>
      <div><b>N° préstamo:</b> #${esc(String(prestamo.idPrestamo))}</div>
      <div><b>Socio:</b> ${esc(prestamo.nombreSocio ?? `Socio #${prestamo.idSocio}`)}</div>
      <div><b>Atendido por:</b> ${esc(prestamo.nombreUsuario ?? `Usuario #${prestamo.idUsuario}`)}</div>
      <div><b>Fecha préstamo:</b> ${esc(formatearFecha(prestamo.fechaPrestamo))}</div>
      <div><b>Devolución esperada:</b> ${esc(formatearFecha(prestamo.fechaDevolucionEsperada))}</div>
      <div class="linea"></div>
      <div><b>Libros (${detalles.length})</b></div>
      ${libros || '<div class="muted">Sin libros</div>'}
      <div class="linea"></div>
      <div class="centro muted">Impreso: ${esc(formatearFecha(hoyTexto()))}</div>
      <div class="centro muted">¡Gracias por su visita!</div>
    </div>`;

    const estilos = `
    @page { size: 80mm auto; margin: 3mm; }
    body { width: 74mm; margin: 0; font-size: 12px; }
    .ticket h2 { margin: 0 0 2px; }
    .ticket .libro { margin: 6px 0; }
    .ticket .linea { margin: 6px 0; }
  `;

    imprimirHTML({ titulo: `Ticket préstamo #${prestamo.idPrestamo}`, cuerpo, estilos });
};

export const comprobanteSocio = (socio: Socio, historial: HistorialPrestamo[]) => {
    const filas = historial
        .map(({ prestamo, detalles }) => {
            const libros = detalles
                .map(
                    (d) =>
                        `${esc(d.nombreLibro ?? `Libro #${d.idLibro}`)} — <span class="${estaPendiente(d) ? "pendiente" : "muted"
                        }">${esc(textoDevolucion(d))}</span>`
                )
                .join("<br/>");
            return `
        <tr>
          <td>#${esc(String(prestamo.idPrestamo))}</td>
          <td>${esc(formatearFecha(prestamo.fechaPrestamo))}</td>
          <td>${esc(formatearFecha(prestamo.fechaDevolucionEsperada))}</td>
          <td>${libros || "—"}</td>
          <td>${prestamo.estado ? "Activo" : "Anulado"}</td>
        </tr>`;
        })
        .join("");

    const cuerpo = `
    <h2>Comprobante de socio</h2>
    <div><b>Nombre:</b> ${esc(socio.nombre)}</div>
    <div><b>Carnet:</b> ${esc(socio.carnet)}</div>
    <div><b>Teléfono:</b> ${esc(socio.telefono || "—")}</div>
    <div><b>Estado:</b> ${socio.estado ? "Activo" : "Anulado"}</div>
    <div class="linea"></div>
    <h3>Historial de préstamos (${historial.length})</h3>
    <table>
      <thead>
        <tr>
          <th>Préstamo</th><th>Fecha</th><th>Devolución esperada</th><th>Libros (devolución)</th><th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${filas || '<tr><td colspan="5" class="centro muted">Sin préstamos</td></tr>'}
      </tbody>
    </table>
    <p class="muted">Impreso: ${esc(formatearFecha(hoyTexto()))}</p>`;

    imprimirHTML({ titulo: `Socio ${socio.nombre}`, cuerpo });
};