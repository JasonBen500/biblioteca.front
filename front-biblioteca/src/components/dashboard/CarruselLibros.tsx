import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TarjetaLibro from "./TarjetaLibro";
import type { Libro } from "../../types/Libro";

interface Props {
    libros: Libro[];
    onPrestar?: (libro: Libro) => void;
    onEditar?: (libro: Libro) => void;
    onAnular?: (libro: Libro) => void;
}

export default function CarruselLibros({ libros, onPrestar, onEditar, onAnular }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const siguiente = () => {
        setActiveIndex((prev) => (prev + 1) % libros.length);
    };

    const anterior = () => {
        setActiveIndex((prev) => (prev - 1 + libros.length) % libros.length);
    };

    useEffect(() => {
        if (isHovered || libros.length <= 1) return;

        const interval = setInterval(siguiente, 2500);
        return () => clearInterval(interval);
    }, [isHovered, libros.length]);

    return (
        <div
            className="relative flex h-[480px] w-full items-center justify-center overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={anterior}
                className="absolute left-4 z-[60] rounded-full bg-white/90 p-3 text-slate-700 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:text-blue-600 sm:left-8"
                aria-label="Anterior"
            >
                <ChevronLeft size={28} />
            </button>

            {libros.map((libro, index) => {
                const total = libros.length;

                let offset = index - activeIndex;

                if (offset > Math.floor(total / 2)) {
                    offset -= total;
                } else if (offset < -Math.floor(total / 2)) {
                    offset += total;
                }

                const absOffset = Math.abs(offset);
                const isActive = offset === 0;

                const isVisible = absOffset <= 5;

                return (
                    <div
                        key={libro.idLibro || index}
                        onClick={() => !isActive && setActiveIndex(index)}
                        className={`absolute w-72 cursor-pointer transition-all duration-700 ease-out ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"
                            }`}
                        style={{
                            transform: `
                translateX(${offset * 170}px) 
                scale(${isActive ? 1.15 : 1 - absOffset * 0.05}) 
              `,
                            zIndex: 50 - absOffset,
                            filter: isActive ? "none" : "blur(2px) brightness(0.9)",
                        }}
                    >
                        <div className={!isActive ? "pointer-events-none" : ""}>
                            <TarjetaLibro
                                libro={libro}
                                onPrestar={onPrestar}
                                onEditar={onEditar}
                                onAnular={onAnular}
                            />
                        </div>
                    </div>
                );
            })}

            <button
                onClick={siguiente}
                className="absolute right-4 z-[60] rounded-full bg-white/90 p-3 text-slate-700 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:text-blue-600 sm:right-8"
                aria-label="Siguiente"
            >
                <ChevronRight size={28} />
            </button>
        </div>
    );
}