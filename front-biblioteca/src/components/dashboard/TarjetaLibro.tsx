import { BookMarked, BookOpen, Ban, Pencil } from "lucide-react";
import type { Libro } from "../../types/Libro";

interface Props {
  libro: Libro;
  onPrestar?: (libro: Libro) => void;
  onEditar?: (libro: Libro) => void;
  onAnular?: (libro: Libro) => void;
}

function TarjetaLibro({ libro, onPrestar, onEditar, onAnular }: Props) {
  const sinStock = libro.ejemplaresDisponibles <= 0;
  const puedePrestar = libro.estado && !sinStock;

  const etiqueta = !libro.estado
    ? { texto: "Inactivo", estilo: "bg-text-muted/15 text-text-muted" }
    : sinStock
      ? { texto: "Sin ejemplares", estilo: "bg-alert/15 text-alert" }
      : {
          texto: `${libro.ejemplaresDisponibles} ${
            libro.ejemplaresDisponibles === 1 ? "ejemplar" : "ejemplares"
          }`,
          estilo: "bg-accent-modern/10 text-accent-modern",
        };

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-border-light bg-bg-surface font-marmelad shadow-sm transition-shadow hover:shadow-md ${
        libro.estado ? "" : "opacity-70"
      }`}
    >
      {/* "Portada" del libro */}
      <div className="flex h-28 items-center justify-center bg-accent-vintage/20 text-accent-vintage">
        <BookOpen size={44} />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${etiqueta.estilo}`}
        >
          {etiqueta.texto}
        </span>

        <h3
          className="mt-2 line-clamp-2 text-base font-extrabold text-text-main"
          title={libro.titulo}
        >
          {libro.titulo}
        </h3>
        <p className="truncate text-sm font-semibold text-text-muted">
          {libro.autor || "Autor desconocido"}
        </p>
        <p className="truncate text-xs font-semibold text-text-muted">
          ISBN: {libro.isbn || "—"}
        </p>
      </div>

      {(onPrestar || onEditar || onAnular) && (
        <div className="flex items-center gap-2 border-t border-border-light p-3">
          {onPrestar && (
            <button
              type="button"
              disabled={!puedePrestar}
              onClick={() => onPrestar(libro)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-modern px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
            >
              <BookMarked size={16} />
              Prestar
            </button>
          )}

          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(libro)}
              title="Editar"
              aria-label="Editar"
              className="rounded-lg p-2 text-text-main/70 transition-colors hover:bg-text-main/10 hover:text-text-main"
            >
              <Pencil size={18} />
            </button>
          )}

          {onAnular && libro.estado && (
            <button
              type="button"
              onClick={() => onAnular(libro)}
              title="Anular"
              aria-label="Anular"
              className="rounded-lg p-2 text-alert transition-colors hover:bg-alert/15"
            >
              <Ban size={18} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default TarjetaLibro;