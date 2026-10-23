import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { CalendarDays, ListChecks, Pencil, Plus, Printer, Undo2 } from "lucide-react";
import {
  anularDetallePrestamo,
  crearDetallePrestamo,
  getDetallePrestamo,
  modificarDetallePrestamo,
} from "../services/detallePrestamoService";
import { getPrestamos } from "../services/prestamosService";
import { getLibros } from "../services/librosService";
import Modal from "../components/Modal";
import BarraBusqueda from "../components/BarraBusqueda";
import Mensaje from "../components/Mensaje";
import TablaDatos, { type ColumnaTabla } from "../components/TablaDatos";
import { filtrarPorTexto } from "../utils/busqueda";
import { formatearFecha, hoyTexto, soloFecha } from "../utils/fechas";
import type { DetallePrestamo as DetalleType } from "../types/DetallePrestamo";
import type { Prestamo } from "../types/Prestamo";
import type { Libro } from "../types/Libro";
import CalendarioMensual from "../components/CalendarioMensual";
import { ticketPrestamo } from "../utils/tickets";

type FiltroDetalle = "pendientes" | "devueltos" | "todos";

const DETALLE_VACIO: DetalleType = {
  idDetallePrestamo: 0,
  idPrestamo: 0,
  idLibro: 0,
  fechaDevolucionReal: "",
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
  inicial: DetalleType;
  prestamos: Prestamo[];
  libros: Libro[];
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

function FormularioDetalle({
  inicial,
  prestamos,
  libros,
  onCerrar,
  onGuardado,
}: PropsFormulario) {
  const [form, setForm] = useState<DetalleType>({
    ...inicial,
    fechaDevolucionReal: inicial.fechaDevolucionReal
      ? soloFecha(inicial.fechaDevolucionReal)
      : "",
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const editando = inicial.idDetallePrestamo !== 0;

  // Préstamos vigentes (más el actual si se está editando)
  const prestamosOpciones = prestamos.filter(
    (p) => p.estado || p.idPrestamo === inicial.idPrestamo,
  );
  // Libros activos con ejemplares (más el actual si se está editando)
  const librosOpciones = libros.filter(
    (l) =>
      (l.estado && l.ejemplaresDisponibles > 0) || l.idLibro === inicial.idLibro,
  );

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.idPrestamo === 0) {
      setError("Error: selecciona un préstamo.");
      return;
    }
    if (form.idLibro === 0) {
      setError("Error: selecciona un libro.");
      return;
    }

    setGuardando(true);
    try {
      if (editando) await modificarDetallePrestamo(form.idDetallePrestamo, form);
      else await crearDetallePrestamo({ ...form, fechaDevolucionReal: "" });
      onGuardado(
        editando ? "Detalle actualizado correctamente" : "Detalle creado correctamente",
      );
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err, "Error: no se pudo guardar el detalle."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      <Mensaje texto={error} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={ESTILO_LABEL}>Préstamo *</label>
          <select
            className={ESTILO_INPUT}
            value={form.idPrestamo}
            onChange={(e) => setForm({ ...form, idPrestamo: Number(e.target.value) })}
          >
            <option value={0}>Seleccione...</option>
            {prestamosOpciones.map((p) => (
              <option key={p.idPrestamo} value={p.idPrestamo}>
                Préstamo #{p.idPrestamo}
                {p.nombreSocio ? ` · ${p.nombreSocio}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={ESTILO_LABEL}>Libro *</label>
          <select
            className={ESTILO_INPUT}
            value={form.idLibro}
            onChange={(e) => setForm({ ...form, idLibro: Number(e.target.value) })}
          >
            <option value={0}>Seleccione...</option>
            {librosOpciones.map((l) => (
              <option key={l.idLibro} value={l.idLibro}>
                {l.titulo}
              </option>
            ))}
          </select>
        </div>

        {editando && (
          <div className="sm:col-span-2">
            <label className={ESTILO_LABEL}>Devolución real</label>
            <input
              type="date"
              className={ESTILO_INPUT}
              value={form.fechaDevolucionReal}
              onChange={(e) => setForm({ ...form, fechaDevolucionReal: e.target.value })}
            />
            <p className="mt-1 font-marmelad text-xs font-semibold text-text-muted">
              Déjala vacía si el libro aún no se devuelve.
            </p>
          </div>
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
          {guardando ? "Guardando..." : editando ? "Actualizar detalle" : "Guardar detalle"}
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

function DetallePrestamo() {
  const [detalles, setDetalles] = useState<DetalleType[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroDetalle>("pendientes");
  const [detalleEnEdicion, setDetalleEnEdicion] = useState<DetalleType | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [resDetalles, resPrestamos, resLibros] = await Promise.all([
        getDetallePrestamo(),
        getPrestamos(),
        getLibros(),
      ]);
      setDetalles(resDetalles.data);
      setPrestamos(resPrestamos.data);
      setLibros(resLibros.data);
    } catch {
      setMensaje("Error: no se pudieron cargar los datos del servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const detallesVisibles = useMemo(() => {
    let lista = detalles;
    if (filtro === "pendientes") lista = lista.filter((d) => d.estado);
    if (filtro === "devueltos") lista = lista.filter((d) => !d.estado);
    return filtrarPorTexto(lista, busqueda);
  }, [detalles, filtro, busqueda]);

  const alGuardar = (texto: string) => {
    setMensaje(texto);
    void cargar();
  };

  // Calendario: solo libros ya devueltos (con fecha real), respetando la búsqueda
  const eventosDevolucion = useMemo(
    () =>
      filtrarPorTexto(
        detalles.filter((d) => d.fechaDevolucionReal),
        busqueda,
      ).map((d) => ({
        id: d.idDetallePrestamo,
        fecha: soloFecha(d.fechaDevolucionReal),
        titulo: d.nombreLibro ?? `Libro #${d.idLibro}`,
        detalle: `${d.descripcionPrestamo ?? `Préstamo #${d.idPrestamo}`} · ${d.nombreSocio ?? "—"}`,
        datos: d,
      })),
    [detalles, busqueda],
  );

  const imprimirTicket = (detalle: DetalleType) => {
    const prestamo = prestamos.find((p) => p.idPrestamo === detalle.idPrestamo);
    if (!prestamo) {
      setMensaje("Error: no se encontró el préstamo de este detalle.");
      return;
    }
    ticketPrestamo(
      prestamo,
      detalles.filter((d) => d.idPrestamo === detalle.idPrestamo),
    );
  };

  const devolver = async (detalle: DetalleType) => {
    if (!window.confirm("¿Registrar la devolución de este libro?")) return;
    try {
      await anularDetallePrestamo(detalle.idDetallePrestamo, {
        fechaDevolucionReal: hoyTexto(),
      });
      setMensaje("Libro devuelto correctamente");
      void cargar();
    } catch (err) {
      setMensaje(mensajeDeError(err, "Error: no se pudo registrar la devolución."));
    }
  };

  const columnas: ColumnaTabla<DetalleType>[] = [
    { encabezado: "Préstamo", valor: (d) => d.descripcionPrestamo ?? `#${d.idPrestamo}` },
    { encabezado: "Socio", valor: (d) => d.nombreSocio ?? "—" },
    { encabezado: "Libro", valor: (d) => d.nombreLibro ?? "—" },
    {
      encabezado: "Devolución real",
      valor: (d) =>
        d.fechaDevolucionReal ? (
          formatearFecha(d.fechaDevolucionReal)
        ) : (
          <span className="rounded-full bg-alert/15 px-3 py-1 text-xs font-extrabold text-alert">
            Pendiente
          </span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 font-marmelad">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Detalle de préstamo</h1>
          <p className="text-sm font-semibold text-text-muted">
            Libros incluidos en cada préstamo y su devolución
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDetalleEnEdicion(DETALLE_VACIO)}
          className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo detalle
        </button>
      </header>

      <Mensaje texto={mensaje} />

      <div className="flex flex-wrap items-center gap-3">
        <BarraBusqueda
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por préstamo, socio o libro..."
        />

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pendientes", "Pendientes"],
              ["devueltos", "Devueltos"],
              ["todos", "Todos"],
            ] as [FiltroDetalle, string][]
          ).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltro(valor)}
              className={estiloFiltro(filtro === valor)}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p className="text-sm font-semibold text-text-muted">Cargando...</p>
      ) : (
        <TablaDatos
          columnas={columnas}
          datos={detallesVisibles}
          claveFila={(d) => d.idDetallePrestamo}
          acciones={(d) => (
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => imprimirTicket(d)}
                title="Imprimir ticket"
                aria-label="Imprimir ticket"
                className="rounded-lg p-2 text-text-main/70 transition-colors hover:bg-text-main/10 hover:text-text-main"
              >
                <Printer size={18} />
              </button>
              <button
                type="button"
                onClick={() => setDetalleEnEdicion(d)}
                title="Editar"
                aria-label="Editar"
                className="rounded-lg p-2 text-text-main/70 transition-colors hover:bg-text-main/10 hover:text-text-main"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                disabled={!d.estado}
                onClick={() => devolver(d)}
                title="Registrar devolución"
                aria-label="Registrar devolución"
                className="rounded-lg p-2 text-accent-modern transition-colors hover:bg-accent-modern/10 disabled:pointer-events-none disabled:opacity-30"
              >
                <Undo2 size={18} />
              </button>
            </div>
          )}
        />
      )}

      {!cargando && (
        <section className="flex flex-col gap-4 rounded-2xl border border-border-light bg-bg-surface p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-text-main">
            <CalendarDays size={20} />
            Calendario de devoluciones
          </h2>
          <CalendarioMensual
            eventos={eventosDevolucion}
            textoVacio="No hay devoluciones este día."
            renderAccion={(evento) => (
              <button
                type="button"
                onClick={() => imprimirTicket(evento.datos as DetalleType)}
                title="Imprimir ticket"
                aria-label="Imprimir ticket"
                className="rounded-lg p-2 text-text-main/70 transition-colors hover:bg-text-main/10 hover:text-text-main"
              >
                <Printer size={18} />
              </button>
            )}
          />
        </section>
      )}

      <Modal
        abierto={detalleEnEdicion !== null}
        titulo={
          detalleEnEdicion?.idDetallePrestamo
            ? "Modificar detalle de préstamo"
            : "Ingresar detalle de préstamo"
        }
        subtitulo="Asocia un libro a un préstamo"
        icono={ListChecks}
        onCerrar={() => setDetalleEnEdicion(null)}
      >
        {detalleEnEdicion && (
          <FormularioDetalle
            inicial={detalleEnEdicion}
            prestamos={prestamos}
            libros={libros}
            onCerrar={() => setDetalleEnEdicion(null)}
            onGuardado={alGuardar}
          />
        )}
      </Modal>
    </div>
  );
}

export default DetallePrestamo;