import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { BookOpen, Plus } from "lucide-react";
import { useDatosInicio } from "../hooks/useDatosInicio";
import { anularLibro, crearLibro, modificarLibro } from "../services/librosService";
import Modal from "../components/Modal";
import BarraBusqueda from "../components/BarraBusqueda";
import Mensaje from "../components/Mensaje";
import TarjetaLibro from "../components/dashboard/TarjetaLibro";
import ModalRegistroPrestamo from "../components/dashboard/ModalRegistroPrestamo";
import { filtrarPorTexto } from "../utils/busqueda";
import { filtrarPorEstado, type FiltroEstado } from "../utils/estados";
import type { Libro } from "../types/Libro";
import GraficaLibrosPedidos from "../components/dashboard/GraficaLibrosPedidos";
import GraficaEjemplares from "../components/dashboard/GraficaEjemplares";
import { useDetallesPrestamo } from "../hooks/useDetallesPrestamo";
import { librosMasPedidos } from "../utils/estadisticas";

type FiltroStock = "todos" | "con" | "sin";

const LIBRO_VACIO: Libro = {
  idLibro: 0,
  titulo: "",
  autor: "",
  isbn: "",
  ejemplaresDisponibles: 1,
  estado: true,
};

const ESTILO_INPUT =
  "w-full rounded-xl border border-border-light bg-bg-surface px-4 py-2 font-marmelad text-sm font-semibold text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-modern";
const ESTILO_LABEL = "mb-1 block font-marmelad text-sm font-extrabold text-text-main";

const mensajeDeError = (err: unknown, porDefecto: string) => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? porDefecto;
  }
  return porDefecto;
};

interface PropsFormulario {
  inicial: Libro;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

function FormularioLibro({ inicial, onCerrar, onGuardado }: PropsFormulario) {
  const [form, setForm] = useState<Libro>(inicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const editando = inicial.idLibro !== 0;

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.titulo.trim() === "") {
      setError("Error: el título es obligatorio.");
      return;
    }
    if (!Number.isInteger(form.ejemplaresDisponibles) || form.ejemplaresDisponibles < 0) {
      setError("Error: los ejemplares deben ser un número entero de 0 o más.");
      return;
    }

    setGuardando(true);
    try {
      const datos = { ...form, titulo: form.titulo.trim() };
      if (editando) await modificarLibro(datos.idLibro, datos);
      else await crearLibro(datos);
      onGuardado(editando ? "Libro modificado correctamente" : "Libro creado correctamente");
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err, "Error: no se pudo guardar el libro."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      <Mensaje texto={error} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={ESTILO_LABEL}>Título *</label>
          <input
            className={ESTILO_INPUT}
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Título del libro"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>Autor</label>
          <input
            className={ESTILO_INPUT}
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
            placeholder="Autor"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>ISBN</label>
          <input
            className={ESTILO_INPUT}
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            placeholder="ISBN"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>Ejemplares disponibles *</label>
          <input
            type="number"
            min={0}
            className={ESTILO_INPUT}
            value={form.ejemplaresDisponibles}
            onChange={(e) =>
              setForm({ ...form, ejemplaresDisponibles: Number(e.target.value) })
            }
          />
        </div>
        {editando && (
          <label className="flex items-center gap-2 self-end pb-2 font-marmelad text-sm font-extrabold text-text-main">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
              className="h-4 w-4 accent-accent-modern"
            />
            Libro activo
          </label>
        )}
      </div>

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
          className="rounded-full bg-accent-modern px-5 py-2 font-marmelad text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : editando ? "Actualizar libro" : "Guardar libro"}
        </button>
      </div>
    </form>
  );
}

const estiloFiltro = (activo: boolean) =>
  `rounded-full px-4 py-2 font-marmelad text-xs font-extrabold transition-colors ${activo
    ? "bg-text-main text-bg-main"
    : "border border-border-light bg-bg-surface text-text-main hover:bg-bg-main"
  }`;

function Libros() {
  const { libros, socios, prestamos, cargando, error, recargar } = useDatosInicio();
  const detalles = useDetallesPrestamo();

  const masPedidos = useMemo(
    () => librosMasPedidos(prestamos, detalles, libros, 5),
    [prestamos, detalles, libros],
  );

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("activos");
  const [filtroStock, setFiltroStock] = useState<FiltroStock>("todos");
  const [mensaje, setMensaje] = useState("");

  const [libroEnEdicion, setLibroEnEdicion] = useState<Libro | null>(null);
  const [libroAPrestar, setLibroAPrestar] = useState<Libro | null>(null);
  const [prestamoAbierto, setPrestamoAbierto] = useState(false);

  const librosVisibles = useMemo(() => {
    let lista = filtrarPorEstado(libros, filtroEstado);
    if (filtroStock === "con") lista = lista.filter((l) => l.ejemplaresDisponibles > 0);
    if (filtroStock === "sin") lista = lista.filter((l) => l.ejemplaresDisponibles <= 0);
    return filtrarPorTexto(lista, busqueda);
  }, [libros, filtroEstado, filtroStock, busqueda]);

  const alGuardar = (texto: string) => {
    setMensaje(texto);
    void recargar();
  };

  const prestar = (libro: Libro) => {
    setLibroAPrestar(libro);
    setPrestamoAbierto(true);
  };

  const cerrarPrestamo = () => {
    setPrestamoAbierto(false);
    setLibroAPrestar(null);
  };

  const anular = async (libro: Libro) => {
    if (!window.confirm(`¿Anular el libro "${libro.titulo}"?`)) return;
    try {
      await anularLibro(libro.idLibro);
      setMensaje("Libro anulado correctamente");
      void recargar();
    } catch (err) {
      setMensaje(mensajeDeError(err, "Error: no se pudo anular el libro."));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-marmelad">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Libros</h1>
          <p className="text-sm font-semibold text-text-muted">
            Catálogo de la biblioteca
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLibroEnEdicion(LIBRO_VACIO)}
          className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo libro
        </button>
      </header>

      <Mensaje texto={error || mensaje} />

      {!cargando && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GraficaLibrosPedidos datos={masPedidos} />
          <GraficaEjemplares libros={libros} />
        </div>
      )}

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <BarraBusqueda
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por título, autor o ISBN..."
        />

        <div className="flex flex-wrap gap-2">
          {(["activos", "inactivos", "todos"] as FiltroEstado[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltroEstado(f)}
              className={estiloFiltro(filtroEstado === f)}
            >
              {f === "activos" ? "Activos" : f === "inactivos" ? "Inactivos" : "Todos"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Cualquier stock"],
              ["con", "Con ejemplares"],
              ["sin", "Sin ejemplares"],
            ] as [FiltroStock, string][]
          ).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltroStock(valor)}
              className={estiloFiltro(filtroStock === valor)}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

      {!cargando && (
        <p className="text-sm font-extrabold text-text-muted">
          Mostrando {librosVisibles.length} de {libros.length}{" "}
          {libros.length === 1 ? "libro" : "libros"}
        </p>
      )}

      {/* Tarjetas */}
      {cargando ? (
        <p className="text-sm font-semibold text-text-muted">Cargando...</p>
      ) : librosVisibles.length === 0 ? (
        <p className="rounded-2xl border border-border-light bg-bg-surface p-8 text-center text-sm font-semibold text-text-muted">
          No hay libros para mostrar.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {librosVisibles.map((libro) => (
            <TarjetaLibro
              key={libro.idLibro}
              libro={libro}
              onPrestar={prestar}
              onEditar={setLibroEnEdicion}
              onAnular={anular}
            />
          ))}
        </div>
      )}

      {/* Modal de nuevo libro / editar libro */}
      <Modal
        abierto={libroEnEdicion !== null}
        titulo={libroEnEdicion?.idLibro ? "Editar libro" : "Nuevo libro"}
        subtitulo="Completa los datos del libro"
        icono={BookOpen}
        onCerrar={() => setLibroEnEdicion(null)}
      >
        {libroEnEdicion && (
          <FormularioLibro
            inicial={libroEnEdicion}
            onCerrar={() => setLibroEnEdicion(null)}
            onGuardado={alGuardar}
          />
        )}
      </Modal>

      {/* Modal de prestar: socio existente o nuevo */}
      <ModalRegistroPrestamo
        abierto={prestamoAbierto}
        libros={libros}
        socios={socios}
        libroInicial={libroAPrestar}
        onCerrar={cerrarPrestamo}
        onRegistrado={alGuardar}
      />
    </div>
  );
}

export default Libros;
