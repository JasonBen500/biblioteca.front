import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { BookMarked, UserPlus, Users, X } from "lucide-react";
import Modal from "../Modal";
import BarraBusqueda from "../BarraBusqueda";
import Mensaje from "../Mensaje";
import { registrarPrestamo } from "../../services/prestamosService";
import { useAuth } from "../../context/AuthContext";
import { filtrarPorTexto } from "../../utils/busqueda";
import { fechaATexto, hoyTexto } from "../../utils/fechas";
import type { Libro } from "../../types/Libro";
import type { Socio } from "../../types/Socio";

interface Props {
    abierto: boolean;
    libros: Libro[];
    socios: Socio[];
    libroInicial?: Libro | null;
    socioInicial?: Socio | null;
    onCerrar: () => void;
    onRegistrado: (mensaje: string) => void;
}

const ESTILO_INPUT =
    "w-full rounded-xl border border-border-light bg-bg-surface px-4 py-2 font-marmelad text-sm font-semibold text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-modern";
const ESTILO_LABEL = "mb-1 block font-marmelad text-sm font-extrabold text-text-main";

// Por defecto la devolución esperada es dentro de 7 días
const fechaDevolucionPorDefecto = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 7);
    return fechaATexto(fecha);
};

const mensajeDeError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        return data?.message ?? "Error: no se pudo registrar el préstamo.";
    }
    return "Error: no se pudo registrar el préstamo.";
};

type ModoSocio = "existente" | "nuevo";

function FormularioPrestamo({
    libros,
    socios,
    libroInicial,
    socioInicial,
    onCerrar,
    onRegistrado,
}: Omit<Props, "abierto">) {
    const { usuario } = useAuth();

    const [modoSocio, setModoSocio] = useState<ModoSocio>("existente");
    const [busquedaSocio, setBusquedaSocio] = useState("");
    const [idSocio, setIdSocio] = useState<number | null>(socioInicial?.idSocio ?? null);
    const [nombreSocio, setNombreSocio] = useState("");
    const [carnetSocio, setCarnetSocio] = useState("");
    const [telefonoSocio, setTelefonoSocio] = useState("");

    const [busquedaLibro, setBusquedaLibro] = useState("");
    const [idsLibros, setIdsLibros] = useState<number[]>(
        libroInicial ? [libroInicial.idLibro] : [],
    );

    const [fechaPrestamo, setFechaPrestamo] = useState(hoyTexto());
    const [fechaDevolucion, setFechaDevolucion] = useState(fechaDevolucionPorDefecto());

    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const sociosFiltrados = useMemo(
        () => filtrarPorTexto(socios.filter((s) => s.estado), busquedaSocio),
        [socios, busquedaSocio],
    );

    const librosDisponibles = useMemo(
        () =>
            filtrarPorTexto(
                libros.filter((l) => l.estado && l.ejemplaresDisponibles > 0),
                busquedaLibro,
            ),
        [libros, busquedaLibro],
    );

    const librosElegidos = libros.filter((l) => idsLibros.includes(l.idLibro));

    const alternarLibro = (idLibro: number) =>
        setIdsLibros((actuales) =>
            actuales.includes(idLibro)
                ? actuales.filter((id) => id !== idLibro)
                : [...actuales, idLibro],
        );

    const manejarSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!usuario) {
            setError("Error: no hay una sesión activa.");
            return;
        }
        if (modoSocio === "existente" && idSocio === null) {
            setError("Error: selecciona un socio o agrega uno nuevo.");
            return;
        }
        if (modoSocio === "nuevo" && nombreSocio.trim() === "") {
            setError("Error: el nombre del socio nuevo es obligatorio.");
            return;
        }
        if (modoSocio === "nuevo" && carnetSocio.trim() === "") {
            setError("Error: el carnet del socio nuevo es obligatorio.");
            return;
        }
        if (idsLibros.length === 0) {
            setError("Error: selecciona al menos un libro.");
            return;
        }
        if (!fechaDevolucion || fechaDevolucion < fechaPrestamo) {
            setError("Error: la devolución esperada no puede ser anterior al préstamo.");
            return;
        }

        setGuardando(true);
        try {
            await registrarPrestamo({
                idSocio: modoSocio === "existente" ? (idSocio ?? undefined) : undefined,
                nombreSocio: modoSocio === "nuevo" ? nombreSocio.trim() : undefined,
                carnetSocio: modoSocio === "nuevo" ? carnetSocio.trim() : undefined,
                telefonoSocio:
                    modoSocio === "nuevo" ? telefonoSocio.trim() || undefined : undefined,
                idUsuario: usuario.idUsuario,
                fechaPrestamo,
                fechaDevolucionEsperada: fechaDevolucion,
                idLibros: idsLibros,
            });
            onRegistrado("Préstamo registrado correctamente");
            onCerrar();
        } catch (err) {
            setError(mensajeDeError(err));
        } finally {
            setGuardando(false);
        }
    };

    const estiloPildora = (activa: boolean) =>
        `inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 font-marmelad text-sm font-bold transition-colors ${activa
            ? "bg-text-main text-bg-main"
            : "border border-border-light text-text-main hover:bg-bg-main"
        }`;

    return (
        <form onSubmit={manejarSubmit} className="flex flex-col gap-6">
            <Mensaje texto={error} />

            {/* Socio */}
            <section>
                <h3 className="mb-2 font-marmelad text-base font-extrabold text-text-main">
                    1. Socio
                </h3>

                <div className="mb-3 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setModoSocio("existente")}
                        className={estiloPildora(modoSocio === "existente")}
                    >
                        <Users size={16} />
                        Socio existente
                    </button>
                    <button
                        type="button"
                        onClick={() => setModoSocio("nuevo")}
                        className={estiloPildora(modoSocio === "nuevo")}
                    >
                        <UserPlus size={16} />
                        Socio nuevo
                    </button>
                </div>

                {modoSocio === "existente" ? (
                    <div className="flex flex-col gap-2">
                        <BarraBusqueda
                            valor={busquedaSocio}
                            onCambiar={setBusquedaSocio}
                            placeholder="Buscar socio por nombre o carnet..."
                        />
                        <div className="max-h-40 overflow-y-auto rounded-xl border border-border-light">
                            {sociosFiltrados.length === 0 ? (
                                <p className="p-4 text-center font-marmelad text-sm font-semibold text-text-muted">
                                    No hay socios para mostrar.
                                </p>
                            ) : (
                                sociosFiltrados.map((socio) => (
                                    <button
                                        key={socio.idSocio}
                                        type="button"
                                        onClick={() => setIdSocio(socio.idSocio)}
                                        className={`flex w-full items-center justify-between gap-3 border-b border-border-light px-4 py-2 text-left font-marmelad text-sm font-semibold last:border-b-0 ${idSocio === socio.idSocio
                                            ? "bg-accent-modern text-white"
                                            : "text-text-main hover:bg-accent-vintage/10"
                                            }`}
                                    >
                                        <span className="truncate">{socio.nombre}</span>
                                        <span className="shrink-0 text-xs opacity-80">
                                            {socio.carnet || "Sin carnet"}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={ESTILO_LABEL}>Nombre *</label>
                            <input
                                className={ESTILO_INPUT}
                                value={nombreSocio}
                                onChange={(e) => setNombreSocio(e.target.value)}
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <label className={ESTILO_LABEL}>Carnet *</label>
                            <input
                                className={ESTILO_INPUT}
                                value={carnetSocio}
                                onChange={(e) => setCarnetSocio(e.target.value)}
                                placeholder="Número de carnet"
                            />
                        </div>
                        <div>
                            <label className={ESTILO_LABEL}>Teléfono</label>
                            <input
                                className={ESTILO_INPUT}
                                value={telefonoSocio}
                                onChange={(e) => setTelefonoSocio(e.target.value)}
                                placeholder="Teléfono"
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* Libros */}
            <section>
                <h3 className="mb-2 font-marmelad text-base font-extrabold text-text-main">
                    2. Libros
                </h3>

                {librosElegidos.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {librosElegidos.map((libro) => (
                            <span
                                key={libro.idLibro}
                                className="inline-flex items-center gap-2 rounded-full bg-accent-vintage/25 py-1 pl-3 pr-1 font-marmelad text-xs font-extrabold text-text-main"
                            >
                                {libro.titulo}
                                <button
                                    type="button"
                                    onClick={() => alternarLibro(libro.idLibro)}
                                    aria-label={`Quitar ${libro.titulo}`}
                                    className="rounded-full p-1 hover:bg-text-main/10"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <BarraBusqueda
                        valor={busquedaLibro}
                        onCambiar={setBusquedaLibro}
                        placeholder="Buscar libro por título, autor o ISBN..."
                    />
                    <div className="max-h-44 overflow-y-auto rounded-xl border border-border-light">
                        {librosDisponibles.length === 0 ? (
                            <p className="p-4 text-center font-marmelad text-sm font-semibold text-text-muted">
                                No hay libros disponibles para mostrar.
                            </p>
                        ) : (
                            librosDisponibles.map((libro) => {
                                const elegido = idsLibros.includes(libro.idLibro);
                                return (
                                    <button
                                        key={libro.idLibro}
                                        type="button"
                                        onClick={() => alternarLibro(libro.idLibro)}
                                        className={`flex w-full items-center justify-between gap-3 border-b border-border-light px-4 py-2 text-left font-marmelad text-sm font-semibold last:border-b-0 ${elegido
                                            ? "bg-accent-modern text-white"
                                            : "text-text-main hover:bg-accent-vintage/10"
                                            }`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate">{libro.titulo}</span>
                                            <span className="block truncate text-xs opacity-80">
                                                {libro.autor}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-xs opacity-80">
                                            {libro.ejemplaresDisponibles} disp.
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* Fechas */}
            <section>
                <h3 className="mb-2 font-marmelad text-base font-extrabold text-text-main">
                    3. Fechas
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className={ESTILO_LABEL}>Fecha de préstamo</label>
                        <input
                            type="date"
                            className={ESTILO_INPUT}
                            value={fechaPrestamo}
                            onChange={(e) => setFechaPrestamo(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={ESTILO_LABEL}>Devolución esperada</label>
                        <input
                            type="date"
                            className={ESTILO_INPUT}
                            value={fechaDevolucion}
                            min={fechaPrestamo}
                            onChange={(e) => setFechaDevolucion(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCerrar}
                    className="rounded-full border border-text-main px-5 py-2 font-marmelad text-sm font-bold text-text-main transition-colors hover:bg-text-main hover:text-white"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={guardando}
                    className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-5 py-2 font-marmelad text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    <BookMarked size={16} />
                    {guardando ? "Registrando..." : "Registrar préstamo"}
                </button>
            </div>
        </form>
    );
}

// El formulario solo se monta cuando el modal está abierto,
// así cada vez empieza limpio
function ModalRegistroPrestamo({
    abierto,
    libros,
    socios,
    libroInicial,
    socioInicial,
    onCerrar,
    onRegistrado,
}: Props) {
    return (
        <Modal
            abierto={abierto}
            titulo="Registrar préstamo"
            subtitulo={
                libroInicial
                    ? `Libro: ${libroInicial.titulo}`
                    : socioInicial
                        ? `Socio: ${socioInicial.nombre}`
                        : "Elige el socio, los libros y las fechas"
            }
            icono={BookMarked}
            onCerrar={onCerrar}
        >
            <FormularioPrestamo
                libros={libros}
                socios={socios}
                libroInicial={libroInicial}
                socioInicial={socioInicial}
                onCerrar={onCerrar}
                onRegistrado={onRegistrado}
            />
        </Modal>
    );
}

export default ModalRegistroPrestamo;