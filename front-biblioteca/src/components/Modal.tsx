import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X } from "lucide-react";
import type { ElementType } from "react";
import logo from "../assets/images/LogoLargo.png";

interface Props {
  abierto: boolean;
  titulo: string;
  subtitulo: string;
  icono?: ElementType;
  onCerrar: () => void;
  children: ReactNode;
}

function Modal({ abierto, titulo, subtitulo, icono: Icono, onCerrar, children }: Props) {
  const idTitulo = useId();
  const idSubtitulo = useId();

  useEffect(() => {
    if (!abierto) return;

    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", alPresionar);

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${idTitulo} ${idSubtitulo}`}
        className="ficha max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-accent-vintage bg-papel p-6 font-marmelad shadow-2xl"
      >
        <div className="-mx-6 -mt-6 mb-4 flex items-start justify-between gap-4 rounded-t-xl border-b-4 border-double border-text-main/30 bg-accent-vintage p-6">
          <div className="flex items-center gap-4">
            {Icono && (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-papel/40 text-text-main ring-2 ring-text-main/30">
                <Icono size={28} />
              </div>
            )}

            <div className="flex flex-col">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-main/60">
                Ficha · Biblioteca
              </p>
              <h2
                id={idTitulo}
                className="font-marmelad text-2xl font-black text-text-main"
              >
                {titulo}
              </h2>

              {subtitulo && (
                <h3
                  id={idSubtitulo}
                  className="mt-1 font-marmelad text-sm font-bold text-text-main/80"
                >
                  {subtitulo}
                </h3>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden h-20 w-40 shrink-0 items-center justify-center rounded-xl p-1.5 ring-text-main/30 sm:flex">
              <img src={logo} alt="Bibliotech" className="h-full w-full object-contain" />
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="rounded-full p-2 text-text-main transition-colors hover:bg-text-main/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Divisor de libro abierto */}
        <div className="mb-5 flex items-center gap-3 text-accent-vintage" aria-hidden="true">
          <span className="h-px flex-1 bg-accent-vintage/40" />
          <BookOpen size={16} />
          <span className="h-px flex-1 bg-accent-vintage/40" />
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;