import { Search, X } from "lucide-react";

interface Props {
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder?: string;
}

function BarraBusqueda({ valor, onCambiar, placeholder = "Buscar..." }: Props) {
  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="text"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border-light bg-bg-surface py-2 pl-10 pr-10 font-marmelad text-sm font-semibold text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-modern"
      />
      {valor && (
        <button
          type="button"
          onClick={() => onCambiar("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default BarraBusqueda;