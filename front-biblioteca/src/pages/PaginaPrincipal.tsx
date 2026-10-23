import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookMarked, Trophy, UserPlus } from "lucide-react";
import { useDatosInicio } from "../hooks/useDatosInicio";
import BarraBusqueda from "../components/BarraBusqueda";
import Mensaje from "../components/Mensaje";
import TarjetaSocio from "../components/dashboard/TarjetaSocio";
import GraficaPrestamosSemana from "../components/dashboard/GraficaPrestamosSemana";
import ModalRegistroPrestamo from "../components/dashboard/ModalRegistroPrestamo";
import ModalNuevoSocio from "../components/dashboard/ModalNuevoSocio";
import CarruselLibros from "../components/dashboard/CarruselLibros";
import { filtrarPorTexto } from "../utils/busqueda";
import {
    prestamosDeLaSemana,
    sociosMasRecurrentes,
} from "../utils/estadisticas";
import type { Libro } from "../types/Libro";
import LogoS from "../assets/images/LogoSimple.png";


function PaginaPrincipal() {
    const { libros, socios, prestamos, cargando, error, recargar } =
        useDatosInicio();

    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [socioModalAbierto, setSocioModalAbierto] = useState(false);
    const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);

    const librosDisponibles = useMemo(
        () =>
            filtrarPorTexto(
                libros.filter((l) => l.estado && l.ejemplaresDisponibles > 0),
                busqueda,
            ),
        [libros, busqueda],
    );

    const sociosRecurrentes = useMemo(
        () => sociosMasRecurrentes(prestamos, socios, 5),
        [prestamos, socios],
    );

    const datosSemana = useMemo(() => prestamosDeLaSemana(prestamos), [prestamos]);

    const abrirRegistro = (libro: Libro | null) => {
        setLibroSeleccionado(libro);
        setModalAbierto(true);
    };

    const cerrarRegistro = () => {
        setModalAbierto(false);
        setLibroSeleccionado(null);
    };

    const alRegistrar = (texto: string) => {
        setMensaje(texto);
        void recargar();
    };

    return (
        <div className="flex flex-col gap-6 p-6 font-marmelad">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="relative flex h-40 w-40 shrink-0 justify-center">
                        <Bookmark
                            size={210}
                            className="absolute inset-0 fill-current text-red-600 drop-shadow-lg"
                            strokeWidth={1}
                        />
                        <div className="absolute top-6 flex h-32 w-32 translate-x-5.5 items-center justify-center">
                            <img
                                src={LogoS}
                                alt="Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-text-main">Página principal</h1>
                            <p className="text-sm font-semibold text-text-muted">
                                Registra préstamos y revisa la actividad de la biblioteca
                            </p>
                        </div>

                        <div className="w-full max-w-md mt-3">
                            <BarraBusqueda
                                valor={busqueda}
                                onCambiar={setBusqueda}
                                placeholder="Buscar libros disponibles..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setSocioModalAbierto(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-text-main px-6 py-3 text-sm font-bold text-text-main transition-colors hover:bg-text-main hover:text-white"
                    >
                        <UserPlus size={18} />
                        Nuevo socio
                    </button>
                    <button
                        type="button"
                        onClick={() => abrirRegistro(null)}
                        className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                    >
                        <BookMarked size={18} />
                        Registrar préstamo
                    </button>
                </div>
            </header>

            <Mensaje texto={error || mensaje} />

            <section>
                <div className=" mt-15 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-extrabold text-text-main">
                        Libros más populares
                    </h2>
                    <Link
                        to="/libros"
                        className="text-lg font-bold text-accent-modern hover:underline"
                    >
                        Ver todos
                    </Link>
                </div>

                {cargando ? (
                    <p className="text-sm font-semibold text-text-muted">Cargando...</p>
                ) : librosDisponibles.length === 0 ? (
                    <p className="rounded-2xl border border-border-light bg-bg-surface p-6 text-center text-sm font-semibold text-text-muted">
                        No hay libros disponibles para mostrar.
                    </p>
                ) : (
                    <CarruselLibros
                        libros={librosDisponibles.slice(0, 15)}
                        onPrestar={abrirRegistro}
                    />
                )}
            </section>

            {/* Gráfica y socios más recurrentes */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <GraficaPrestamosSemana datos={datosSemana} />
                </div>

                <section className="rounded-2xl border border-border-light bg-bg-surface p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-accent-vintage" />
                        <h2 className="text-lg font-extrabold text-text-main">
                            Socios más recurrentes
                        </h2>
                    </div>

                    {sociosRecurrentes.length === 0 ? (
                        <p className="text-sm font-semibold text-text-muted">
                            Aún no hay préstamos registrados.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {sociosRecurrentes.map(({ socio, total }) => (
                                <TarjetaSocio
                                    key={socio.idSocio}
                                    socio={socio}
                                    totalPrestamos={total}
                                    compacta
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <ModalRegistroPrestamo
                abierto={modalAbierto}
                libros={libros}
                socios={socios}
                libroInicial={libroSeleccionado}
                onCerrar={cerrarRegistro}
                onRegistrado={alRegistrar}
            />

            <ModalNuevoSocio
                abierto={socioModalAbierto}
                onCerrar={() => setSocioModalAbierto(false)}
                onGuardado={alRegistrar}
            />
        </div>
    );
}

export default PaginaPrincipal;