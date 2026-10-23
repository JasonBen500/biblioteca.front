import { Pencil, Ban, Trash2, Eye, Printer } from "lucide-react";

interface Props {
  onVerDetalles?: () => void;
  onEditar: () => void;
  onAnular: () => void;
  onEliminar?: () => void;
  onImprimir?: () => void;
}

const base = "rounded-lg p-2 transition-colors";

function AccionesFila({ onVerDetalles, onImprimir, onEditar, onAnular, onEliminar }: Props) {
  return (
    <div className="flex items-center justify-center gap-1">
      {onVerDetalles && (
        <button
          type="button"
          onClick={onVerDetalles}
          title="Ver detalles"
          aria-label="Ver detalles"
          className={`${base} text-accent-modern hover:bg-accent-modern/10`}
        >
          <Eye size={18} />
        </button>
      )}

      {onImprimir && (
        <button
          type="button"
          onClick={onImprimir}
          title="Imprimir ticket"
          aria-label="Imprimir ticket"
          className={`${base} text-text-main/70 hover:bg-text-main/10 hover:text-text-main`}
        >
          <Printer size={18} />
        </button>
      )}

      <button
        type="button"
        onClick={onEditar}
        title="Editar"
        aria-label="Editar"
        className={`${base} text-text-main/70 hover:bg-text-main/10 hover:text-text-main`}
      >
        <Pencil size={18} />
      </button>

      <button
        type="button"
        onClick={onAnular}
        title="Anular"
        aria-label="Anular"
        className={`${base} text-alert hover:bg-alert/15`}
      >
        <Ban size={18} />
      </button>

      {onEliminar && (
        <button
          type="button"
          onClick={onEliminar}
          title="Eliminar"
          aria-label="Eliminar"
          className={`${base} text-red-600 hover:bg-red-600/10`}
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

export default AccionesFila;