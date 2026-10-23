import { Ban, BookMarked, Eye, IdCard, Pencil, Phone } from "lucide-react";
import type { Socio } from "../../types/Socio";

interface Props {
  socio: Socio;
  totalPrestamos: number;
  compacta?: boolean;
  onEditar?: (socio: Socio) => void;
  onAnular?: (socio: Socio) => void;
  onVerDetalles?: (socio: Socio) => void;
  onIniciarPrestamo?: (socio: Socio) => void;
}

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

function TarjetaSocio({
  socio,
  totalPrestamos,
  compacta = false,
  onEditar,
  onAnular,
  onVerDetalles,
  onIniciarPrestamo,
}: Props) {
  const textoPrestamos = `${totalPrestamos} ${totalPrestamos === 1 ? "préstamo" : "préstamos"
    }`;

  // Versión pequeña para la pantalla principal
  if (compacta) {
    return (
      <article className="flex items-center gap-3 rounded-2xl border border-border-light bg-bg-surface p-3 font-marmelad shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-vintage text-sm font-extrabold text-text-main">
          {iniciales(socio.nombre)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-text-main">
            {socio.nombre}
          </p>
          <p className="text-xs font-bold text-accent-modern">{textoPrestamos}</p>
        </div>
      </article>
    );
  }

  // Versión completa para la página de socios
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-border-light bg-bg-surface font-marmelad shadow-sm transition-shadow hover:shadow-md ${socio.estado ? "" : "opacity-70"
        }`}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-vintage text-lg font-extrabold text-text-main">
          {iniciales(socio.nombre)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold text-text-main">
            {socio.nombre}
          </h3>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${socio.estado
              ? "bg-accent-modern/10 text-accent-modern"
              : "bg-text-muted/15 text-text-muted"
              }`}
          >
            {socio.estado ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-4 pb-4 text-sm font-semibold text-text-muted">
        <p className="flex items-center gap-2">
          <IdCard size={16} />
          Carnet: {socio.carnet || "—"}
        </p>
        <p className="flex items-center gap-2">
          <Phone size={16} />
          {socio.telefono || "—"}
        </p>
      </div>

      {(onVerDetalles || onIniciarPrestamo) && (
        <div className="flex gap-2 px-4 pb-4">
          {onVerDetalles && (
            <button
              type="button"
              onClick={() => onVerDetalles(socio)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-text-main px-3 py-2 text-xs font-bold text-text-main transition-colors hover:bg-text-main hover:text-white"
            >
              <Eye size={14} />
              Ver detalles
            </button>
          )}
          {onIniciarPrestamo && socio.estado && (
            <button
              type="button"
              onClick={() => onIniciarPrestamo(socio)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-modern px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              <BookMarked size={14} />
              Iniciar préstamo
            </button>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border-light bg-bg-main p-3">
        <span className="rounded-full bg-text-main px-3 py-1 text-xs font-extrabold text-bg-main">
          {textoPrestamos}
        </span>

        <div className="flex items-center gap-1">
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(socio)}
              title="Editar"
              aria-label="Editar"
              className="rounded-lg p-2 text-text-main/70 transition-colors hover:bg-text-main/10 hover:text-text-main"
            >
              <Pencil size={18} />
            </button>
          )}
          {onAnular && socio.estado && (
            <button
              type="button"
              onClick={() => onAnular(socio)}
              title="Anular"
              aria-label="Anular"
              className="rounded-lg p-2 text-alert transition-colors hover:bg-alert/15"
            >
              <Ban size={18} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default TarjetaSocio;