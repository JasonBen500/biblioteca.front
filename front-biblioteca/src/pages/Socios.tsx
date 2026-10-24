import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { Plus, Users } from "lucide-react";
import { useDatosInicio } from "../hooks/useDatosInicio";
import { anularSocio, crearSocio, modificarSocio } from "../services/sociosSsrvice";
import Modal from "../components/Modal";
import BarraBusqueda from "../components/BarraBusqueda";
import Mensaje from "../components/Mensaje";
import TarjetaSocio from "../components/dashboard/TarjetaSocio";
import ModalDetalleSocio from "../components/dashboard/ModalDetalleSocio";
import ModalRegistroPrestamo from "../components/dashboard/ModalRegistroPrestamo";
import { filtrarPorTexto } from "../utils/busqueda";
import { filtrarPorEstado, type FiltroEstado } from "../utils/estados";
import { compararSociosActivos, contarPrestamosPorSocio } from "../utils/estadisticas";
import type { Socio } from "../types/Socio";
import GraficaSociosActivos from "../components/dashboard/GraficaSociosActivos";
import { useDetallesPrestamo } from "../hooks/useDetallesPrestamo";
import { useAuth } from "../context/AuthContext";
import { puedeAnular } from "../utils/permisos";


const SOCIO_VACIO: Socio = {
  idSocio: 0,
  nombre: "",
  carnet: "",
  telefono: "",
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
  inicial: Socio;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

function FormularioSocio({ inicial, onCerrar, onGuardado }: PropsFormulario) {
  const [form, setForm] = useState<Socio>(inicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const editando = inicial.idSocio !== 0;

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.nombre.trim() === "") {
      setError("Error: el nombre es obligatorio.");
      return;
    }
    if (form.carnet.trim() === "") {
      setError("Error: el carnet es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        ...form,
        nombre: form.nombre.trim(),
        carnet: form.carnet.trim(),
        telefono: form.telefono.trim(),
      };
      if (editando) await modificarSocio(datos.idSocio, datos);
      else await crearSocio(datos);
      onGuardado(editando ? "Socio modificado correctamente" : "Socio creado correctamente");
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err, "Error: no se pudo guardar el socio."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      <Mensaje texto={error} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={ESTILO_LABEL}>Nombre *</label>
          <input
            className={ESTILO_INPUT}
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>Carnet *</label>
          <input
            className={ESTILO_INPUT}
            value={form.carnet}
            onChange={(e) => setForm({ ...form, carnet: e.target.value })}
            placeholder="Número de carnet"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>Teléfono</label>
          <input
            className={ESTILO_INPUT}
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="Teléfono"
          />
        </div>
        {editando && (
          <label className="flex items-center gap-2 font-marmelad text-sm font-extrabold text-text-main sm:col-span-2">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
              className="h-4 w-4 accent-accent-modern"
            />
            Socio activo
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
          {guardando ? "Guardando..." : editando ? "Actualizar socio" : "Guardar socio"}
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

function Socios() {
  const { libros, socios, prestamos, cargando, error, recargar } = useDatosInicio();
  const { rol } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("activos");
  const [mensaje, setMensaje] = useState("");
  const [socioEnEdicion, setSocioEnEdicion] = useState<Socio | null>(null);
  const [socioDetalle, setSocioDetalle] = useState<Socio | null>(null);
  const [socioPrestamo, setSocioPrestamo] = useState<Socio | null>(null);
  const detalles = useDetallesPrestamo();
  const comparacionSocios = useMemo(
    () => compararSociosActivos(prestamos, socios, detalles, 5),
    [prestamos, socios, detalles],
  );

  const conteoPrestamos = useMemo(
    () => contarPrestamosPorSocio(prestamos),
    [prestamos],
  );

  const sociosVisibles = useMemo(
    () => filtrarPorTexto(filtrarPorEstado(socios, filtroEstado), busqueda),
    [socios, filtroEstado, busqueda],
  );

  const alGuardar = (texto: string) => {
    setMensaje(texto);
    void recargar();
  };

  const anular = async (socio: Socio) => {
    if (!window.confirm(`¿Anular al socio "${socio.nombre}"?`)) return;
    try {
      await anularSocio(socio.idSocio);
      setMensaje("Socio anulado correctamente");
      void recargar();
    } catch (err) {
      setMensaje(mensajeDeError(err, "Error: no se pudo anular el socio."));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-marmelad">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Socios</h1>
          <p className="text-sm font-semibold text-text-muted">
            Personas registradas y cuántos préstamos llevan
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSocioEnEdicion(SOCIO_VACIO)}
          className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo socio
        </button>
      </header>

      <Mensaje texto={error || mensaje} />

      {!cargando && <GraficaSociosActivos datos={comparacionSocios} />}

      <div className="flex flex-wrap items-center gap-3">
        <BarraBusqueda
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por nombre, carnet o teléfono..."
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
      </div>

      {!cargando && (
        <p className="text-sm font-extrabold text-text-muted">
          Mostrando {sociosVisibles.length} de {socios.length}{" "}
          {socios.length === 1 ? "socio" : "socios"}
        </p>
      )}

      {cargando ? (
        <p className="text-sm font-semibold text-text-muted">Cargando...</p>
      ) : sociosVisibles.length === 0 ? (
        <p className="rounded-2xl border border-border-light bg-bg-surface p-8 text-center text-sm font-semibold text-text-muted">
          No hay socios para mostrar.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sociosVisibles.map((socio) => (
            <TarjetaSocio
              key={socio.idSocio}
              socio={socio}
              totalPrestamos={conteoPrestamos.get(socio.idSocio) ?? 0}
              onEditar={setSocioEnEdicion}
              onAnular={puedeAnular(rol) ? anular : undefined}
              onVerDetalles={setSocioDetalle}
              onIniciarPrestamo={setSocioPrestamo}
            />
          ))}
          <ModalDetalleSocio
            socio={socioDetalle}
            prestamos={prestamos}
            onCerrar={() => setSocioDetalle(null)}
          />

          <ModalRegistroPrestamo
            abierto={socioPrestamo !== null}
            libros={libros}
            socios={socios}
            socioInicial={socioPrestamo}
            onCerrar={() => setSocioPrestamo(null)}
            onRegistrado={alGuardar}
          />
        </div>
      )}

      <Modal
        abierto={socioEnEdicion !== null}
        titulo={socioEnEdicion?.idSocio ? "Editar socio" : "Nuevo socio"}
        subtitulo="Completa los datos del socio"
        icono={Users}
        onCerrar={() => setSocioEnEdicion(null)}
      >
        {socioEnEdicion && (
          <FormularioSocio
            inicial={socioEnEdicion}
            onCerrar={() => setSocioEnEdicion(null)}
            onGuardado={alGuardar}
          />
        )}
      </Modal>
    </div>
  );
}

export default Socios;
