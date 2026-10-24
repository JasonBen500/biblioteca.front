import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { BookMarked, CalendarDays, ClipboardList, Plus, Printer } from "lucide-react";
import { useDatosInicio } from "../hooks/useDatosInicio";
import { anularPrestamo, modificarPrestamo } from "../services/prestamosService";
import { getUsuarios } from "../services/usuariosService";
import Modal from "../components/Modal";
import BarraBusqueda from "../components/BarraBusqueda";
import Mensaje from "../components/Mensaje";
import TablaDatos, { type ColumnaTabla } from "../components/TablaDatos";
import AccionesFila from "../components/AccionesFilas";
import CalendarioMensual from "../components/CalendarioMensual";
import { ticketPrestamo } from "../utils/tickets";
import { getDetallePorPrestamo } from "../services/detallePrestamoService";
import ModalRegistroPrestamo from "../components/dashboard/ModalRegistroPrestamo";
import { filtrarPorTexto } from "../utils/busqueda";
import { filtrarPorEstado, type FiltroEstado } from "../utils/estados";
import { formatearFecha, soloFecha } from "../utils/fechas";
import type { Prestamo } from "../types/Prestamo";
import type { Socio } from "../types/Socio";
import type { Usuario } from "../types/Usuario";
import { useAuth } from "../context/AuthContext";
import { puedeAnular } from "../utils/permisos";

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
  inicial: Prestamo;
  socios: Socio[];
  usuarios: Usuario[];
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

function FormularioPrestamoEdicion({
  inicial,
  socios,
  usuarios,
  onCerrar,
  onGuardado,
}: PropsFormulario) {
  const [form, setForm] = useState<Prestamo>({
    ...inicial,
    fechaPrestamo: soloFecha(inicial.fechaPrestamo),
    fechaDevolucionEsperada: soloFecha(inicial.fechaDevolucionEsperada),
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Activos, más el que ya tiene el préstamo
  const sociosOpciones = socios.filter((s) => s.estado || s.idSocio === inicial.idSocio);
  const usuariosOpciones = usuarios.filter(
    (u) => u.estado || u.idUsuario === inicial.idUsuario,
  );

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.idSocio === 0 || form.idUsuario === 0) {
      setError("Error: selecciona el socio y quién atendió el préstamo.");
      return;
    }
    if (!form.fechaPrestamo || !form.fechaDevolucionEsperada) {
      setError("Error: las dos fechas son obligatorias.");
      return;
    }
    if (form.fechaDevolucionEsperada < form.fechaPrestamo) {
      setError("Error: la devolución esperada no puede ser anterior al préstamo.");
      return;
    }

    setGuardando(true);
    try {
      await modificarPrestamo(form.idPrestamo, form);
      onGuardado("Préstamo modificado correctamente");
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err, "Error: no se pudo modificar el préstamo."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      <Mensaje texto={error} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={ESTILO_LABEL}>Socio *</label>
          <select
            className={ESTILO_INPUT}
            value={form.idSocio}
            onChange={(e) => setForm({ ...form, idSocio: Number(e.target.value) })}
          >
            <option value={0}>Seleccione...</option>
            {sociosOpciones.map((s) => (
              <option key={s.idSocio} value={s.idSocio}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={ESTILO_LABEL}>Atendido por *</label>
          <select
            className={ESTILO_INPUT}
            value={form.idUsuario}
            onChange={(e) => setForm({ ...form, idUsuario: Number(e.target.value) })}
          >
            <option value={0}>Seleccione...</option>
            {usuariosOpciones.map((u) => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={ESTILO_LABEL}>Fecha de préstamo *</label>
          <input
            type="date"
            className={ESTILO_INPUT}
            value={form.fechaPrestamo}
            onChange={(e) => setForm({ ...form, fechaPrestamo: e.target.value })}
          />
        </div>

        <div>
          <label className={ESTILO_LABEL}>Devolución esperada *</label>
          <input
            type="date"
            className={ESTILO_INPUT}
            value={form.fechaDevolucionEsperada}
            min={form.fechaPrestamo}
            onChange={(e) =>
              setForm({ ...form, fechaDevolucionEsperada: e.target.value })
            }
          />
        </div>

        <label className="flex items-center gap-2 font-marmelad text-sm font-extrabold text-text-main sm:col-span-2">
          <input
            type="checkbox"
            checked={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.checked })}
            className="h-4 w-4 accent-accent-modern"
          />
          Préstamo vigente
        </label>
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
          {guardando ? "Guardando..." : "Actualizar préstamo"}
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

function Prestamos() {
  const { libros, socios, prestamos, cargando, error, recargar } = useDatosInicio();
  const { rol } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("activos");
  const [mensaje, setMensaje] = useState("");
  const [prestamoEnEdicion, setPrestamoEnEdicion] = useState<Prestamo | null>(null);
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const [vistaCalendario, setVistaCalendario] = useState<"prestamo" | "devolucion">(
    "prestamo",
  );

  useEffect(() => {
    getUsuarios()
      .then((res) => setUsuarios(res.data))
      .catch(() => setMensaje("Error: no se pudieron cargar los usuarios."));
  }, []);

  const prestamosVisibles = useMemo(
    () => filtrarPorTexto(filtrarPorEstado(prestamos, filtroEstado), busqueda),
    [prestamos, filtroEstado, busqueda],
  );

  const eventosCalendario = useMemo(
    () =>
      prestamosVisibles.map((p) => ({
        id: p.idPrestamo,
        fecha: soloFecha(
          vistaCalendario === "prestamo" ? p.fechaPrestamo : p.fechaDevolucionEsperada,
        ),
        titulo: `#${p.idPrestamo} · ${p.nombreSocio ?? "Socio"}`,
        detalle:
          vistaCalendario === "prestamo"
            ? `Devolución esperada: ${formatearFecha(p.fechaDevolucionEsperada)}`
            : `Prestado el ${formatearFecha(p.fechaPrestamo)}`,
        datos: p,
      })),
    [prestamosVisibles, vistaCalendario],
  );

  const imprimirTicket = async (prestamo: Prestamo) => {
    try {
      const res = await getDetallePorPrestamo(prestamo.idPrestamo);
      ticketPrestamo(prestamo, res.data);
    } catch (err) {
      setMensaje(mensajeDeError(err, "Error: no se pudo imprimir el ticket."));
    }
  };

  const alGuardar = (texto: string) => {
    setMensaje(texto);
    void recargar();
  };

  const anular = async (prestamo: Prestamo) => {
    if (
      !window.confirm(
        `¿Anular el préstamo #${prestamo.idPrestamo}? Los libros pendientes se devuelven desde "Detalle de préstamo".`,
      )
    )
      return;
    try {
      await anularPrestamo(prestamo.idPrestamo);
      setMensaje("Préstamo anulado correctamente");
      void recargar();
    } catch (err) {
      setMensaje(mensajeDeError(err, "Error: no se pudo anular el préstamo."));
    }
  };

  const columnas: ColumnaTabla<Prestamo>[] = [
    { encabezado: "N°", valor: (p) => `#${p.idPrestamo}` },
    { encabezado: "Socio", valor: (p) => p.nombreSocio ?? "—" },
    { encabezado: "Atendido por", valor: (p) => p.nombreUsuario ?? "—" },
    { encabezado: "Fecha de préstamo", valor: (p) => formatearFecha(p.fechaPrestamo) },
    {
      encabezado: "Devolución esperada",
      valor: (p) => formatearFecha(p.fechaDevolucionEsperada),
    },
    {
      encabezado: "Estado",
      valor: (p) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${p.estado
            ? "bg-accent-modern/10 text-accent-modern"
            : "bg-text-muted/15 text-text-muted"
            }`}
        >
          {p.estado ? "Vigente" : "Anulado"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 font-marmelad">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Préstamos</h1>
          <p className="text-sm font-semibold text-text-muted">
            Historial de préstamos de la biblioteca
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRegistroAbierto(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          <BookMarked size={18} />
          Registrar préstamo
        </button>
      </header>

      <Mensaje texto={error || mensaje} />

      <div className="flex flex-wrap items-center gap-3">
        <BarraBusqueda
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por socio, usuario o fecha..."
        />

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["activos", "Vigentes"],
              ["inactivos", "Anulados"],
              ["todos", "Todos"],
            ] as [FiltroEstado, string][]
          ).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltroEstado(valor)}
              className={estiloFiltro(filtroEstado === valor)}
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
          datos={prestamosVisibles}
          claveFila={(p) => p.idPrestamo}
          acciones={(p) => (
            <AccionesFila
              onEditar={() => setPrestamoEnEdicion(p)}
              onImprimir={() => void imprimirTicket(p)}
              onAnular={puedeAnular(rol) ? () => anular(p) : undefined}
            />
          )}
        />
      )}

      {!cargando && (
        <section className="flex flex-col gap-4 rounded-2xl border border-border-light bg-bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-text-main">
              <CalendarDays size={20} />
              Calendario
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVistaCalendario("prestamo")}
                className={estiloFiltro(vistaCalendario === "prestamo")}
              >
                Fecha de préstamo
              </button>
              <button
                type="button"
                onClick={() => setVistaCalendario("devolucion")}
                className={estiloFiltro(vistaCalendario === "devolucion")}
              >
                Devolución esperada
              </button>
            </div>
          </div>

          <CalendarioMensual
            eventos={eventosCalendario}
            textoVacio="No hay préstamos este día."
            renderAccion={(evento) => (
              <button
                type="button"
                onClick={() => void imprimirTicket(evento.datos as Prestamo)}
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

      {/* Modificar préstamo */}
      <Modal
        abierto={prestamoEnEdicion !== null}
        titulo="Modificar préstamo"
        subtitulo={prestamoEnEdicion ? `Préstamo #${prestamoEnEdicion.idPrestamo}` : ""}
        icono={ClipboardList}
        onCerrar={() => setPrestamoEnEdicion(null)}
      >
        {prestamoEnEdicion && (
          <FormularioPrestamoEdicion
            inicial={prestamoEnEdicion}
            socios={socios}
            usuarios={usuarios}
            onCerrar={() => setPrestamoEnEdicion(null)}
            onGuardado={alGuardar}
          />
        )}
      </Modal>

      {/* Registrar préstamo nuevo */}
      <ModalRegistroPrestamo
        abierto={registroAbierto}
        libros={libros}
        socios={socios}
        onCerrar={() => setRegistroAbierto(false)}
        onRegistrado={alGuardar}
      />
    </div>
  );
}

export default Prestamos;
