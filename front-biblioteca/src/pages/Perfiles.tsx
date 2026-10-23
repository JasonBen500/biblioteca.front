import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { Plus, ShieldCheck } from "lucide-react";
import {
  anularPerfil,
  crearPerfil,
  getPerfiles,
  modificarPerfil,
} from "../services/perfilesservices";
import Modal from "../components/Modal";
import BarraBusqueda from "../components/BarraBusqueda";
import Mensaje from "../components/Mensaje";
import TablaDatos, { type ColumnaTabla } from "../components/TablaDatos";
import AccionesFila from "../components/AccionesFilas";
import { filtrarPorTexto } from "../utils/busqueda";
import { filtrarPorEstado, type FiltroEstado } from "../utils/estados";
import type { Perfil } from "../types/Perfil";

const PERFIL_VACIO: Perfil = { idPerfil: 0, nombre: "", estado: true };

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
  inicial: Perfil;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

function FormularioPerfil({ inicial, onCerrar, onGuardado }: PropsFormulario) {
  const [form, setForm] = useState<Perfil>(inicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const editando = inicial.idPerfil !== 0;

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.nombre.trim() === "") {
      setError("Error: el nombre del perfil es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      const datos = { ...form, nombre: form.nombre.trim() };
      if (editando) await modificarPerfil(datos.idPerfil, datos);
      else await crearPerfil(datos);
      onGuardado(
        editando ? "Perfil modificado correctamente" : "Perfil creado correctamente",
      );
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err, "Error: no se pudo guardar el perfil."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      <Mensaje texto={error} />

      <div>
        <label className={ESTILO_LABEL}>Nombre del perfil *</label>
        <input
          className={ESTILO_INPUT}
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej. Administrador, Bibliotecario"
        />
      </div>

      {editando && (
        <label className="flex items-center gap-2 font-marmelad text-sm font-extrabold text-text-main">
          <input
            type="checkbox"
            checked={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.checked })}
            className="h-4 w-4 accent-accent-modern"
          />
          Perfil activo
        </label>
      )}

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
          {guardando ? "Guardando..." : editando ? "Actualizar perfil" : "Guardar perfil"}
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

function Perfiles() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("activos");
  const [perfilEnEdicion, setPerfilEnEdicion] = useState<Perfil | null>(null);

  const cargar = useCallback(async () => {
    try {
      setPerfiles((await getPerfiles()).data);
    } catch {
      setMensaje("Error: no se pudieron cargar los perfiles.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const perfilesVisibles = useMemo(
    () => filtrarPorTexto(filtrarPorEstado(perfiles, filtroEstado), busqueda),
    [perfiles, filtroEstado, busqueda],
  );

  const alGuardar = (texto: string) => {
    setMensaje(texto);
    void cargar();
  };

  const anular = async (perfil: Perfil) => {
    if (!window.confirm(`¿Anular el perfil "${perfil.nombre}"?`)) return;
    try {
      await anularPerfil(perfil.idPerfil);
      setMensaje("Perfil anulado correctamente");
      void cargar();
    } catch (err) {
      setMensaje(mensajeDeError(err, "Error: no se pudo anular el perfil."));
    }
  };

  const columnas: ColumnaTabla<Perfil>[] = [
    { encabezado: "Nombre del perfil", valor: (p) => p.nombre },
    {
      encabezado: "Estado",
      valor: (p) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${p.estado
              ? "bg-accent-modern/10 text-accent-modern"
              : "bg-text-muted/15 text-text-muted"
            }`}
        >
          {p.estado ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 font-marmelad">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Perfiles</h1>
          <p className="text-sm font-semibold text-text-muted">
            Roles que se asignan a los usuarios
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPerfilEnEdicion(PERFIL_VACIO)}
          className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo perfil
        </button>
      </header>

      <Mensaje texto={mensaje} />

      <div className="flex flex-wrap items-center gap-3">
        <BarraBusqueda
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar perfil..."
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

      {cargando ? (
        <p className="text-sm font-semibold text-text-muted">Cargando...</p>
      ) : (
        <TablaDatos
          columnas={columnas}
          datos={perfilesVisibles}
          claveFila={(p) => p.idPerfil}
          acciones={(p) => (
            <AccionesFila
              onEditar={() => setPerfilEnEdicion(p)}
              onAnular={() => anular(p)}
            />
          )}
        />
      )}

      <Modal
        abierto={perfilEnEdicion !== null}
        titulo={perfilEnEdicion?.idPerfil ? "Editar perfil" : "Nuevo perfil"}
        subtitulo="Define el nombre del perfil"
        icono={ShieldCheck}
        onCerrar={() => setPerfilEnEdicion(null)}
      >
        {perfilEnEdicion && (
          <FormularioPerfil
            inicial={perfilEnEdicion}
            onCerrar={() => setPerfilEnEdicion(null)}
            onGuardado={alGuardar}
          />
        )}
      </Modal>
    </div>
  );
}

export default Perfiles;
