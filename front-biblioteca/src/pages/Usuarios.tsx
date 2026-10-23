import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { Plus, UserRound } from "lucide-react";
import {
  anularUsuario,
  crearUsuario,
  getUsuarios,
  modificarUsuario,
} from "../services/usuariosService";
import { getPerfiles } from "../services/perfilesservices";
import Modal from "../components/Modal";
import BarraBusqueda from "../components/BarraBusqueda";
import Mensaje from "../components/Mensaje";
import TablaDatos, { type ColumnaTabla } from "../components/TablaDatos";
import AccionesFila from "../components/AccionesFilas";
import { filtrarPorTexto } from "../utils/busqueda";
import { filtrarPorEstado, type FiltroEstado } from "../utils/estados";
import type { Usuario } from "../types/Usuario";
import type { Perfil } from "../types/Perfil";

const USUARIO_VACIO: Usuario = {
  idUsuario: 0,
  idPerfil: 0,
  nombre: "",
  usuario: "",
  contrasena: "",
  correo: "",
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
  inicial: Usuario;
  perfiles: Perfil[];
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

function FormularioUsuario({ inicial, perfiles, onCerrar, onGuardado }: PropsFormulario) {
  const [form, setForm] = useState<Usuario>(inicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const editando = inicial.idUsuario !== 0;

  // Perfiles activos, más el que ya tiene el usuario
  const perfilesOpciones = perfiles.filter(
    (p) => p.estado || p.idPerfil === inicial.idPerfil,
  );

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.nombre.trim() === "") {
      setError("Error: el nombre es obligatorio.");
      return;
    }
    if (form.usuario.trim() === "") {
      setError("Error: el usuario es obligatorio.");
      return;
    }
    if (form.contrasena === "") {
      setError("Error: la contraseña es obligatoria.");
      return;
    }
    if (form.idPerfil === 0) {
      setError("Error: selecciona un perfil.");
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        ...form,
        nombre: form.nombre.trim(),
        usuario: form.usuario.trim(),
        correo: form.correo.trim(),
      };
      if (editando) await modificarUsuario(datos.idUsuario, datos);
      else await crearUsuario(datos);
      onGuardado(
        editando ? "Usuario modificado correctamente" : "Usuario creado correctamente",
      );
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err, "Error: no se pudo guardar el usuario."));
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
          <label className={ESTILO_LABEL}>Usuario *</label>
          <input
            className={ESTILO_INPUT}
            value={form.usuario}
            onChange={(e) => setForm({ ...form, usuario: e.target.value })}
            placeholder="Nombre de usuario"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>Contraseña *</label>
          <input
            type="password"
            className={ESTILO_INPUT}
            value={form.contrasena}
            onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
            placeholder="Contraseña"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>Correo</label>
          <input
            type="email"
            className={ESTILO_INPUT}
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <label className={ESTILO_LABEL}>Perfil *</label>
          <select
            className={ESTILO_INPUT}
            value={form.idPerfil}
            onChange={(e) => setForm({ ...form, idPerfil: Number(e.target.value) })}
          >
            <option value={0}>Seleccione...</option>
            {perfilesOpciones.map((p) => (
              <option key={p.idPerfil} value={p.idPerfil}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        {editando && (
          <label className="flex items-center gap-2 font-marmelad text-sm font-extrabold text-text-main sm:col-span-2">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
              className="h-4 w-4 accent-accent-modern"
            />
            Usuario activo
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
          {guardando ? "Guardando..." : editando ? "Actualizar usuario" : "Guardar usuario"}
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

function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("activos");
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [resUsuarios, resPerfiles] = await Promise.all([
        getUsuarios(),
        getPerfiles(),
      ]);
      setUsuarios(resUsuarios.data);
      setPerfiles(resPerfiles.data);
    } catch {
      setMensaje("Error: no se pudieron cargar los datos del servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const usuariosVisibles = useMemo(() => {
    const lista = filtrarPorEstado(usuarios, filtroEstado);
    // La búsqueda no debe mirar la contraseña
    const ids = new Set(
      filtrarPorTexto(
        lista.map((u) => ({ ...u, contrasena: "" })),
        busqueda,
      ).map((u) => u.idUsuario),
    );
    return lista.filter((u) => ids.has(u.idUsuario));
  }, [usuarios, filtroEstado, busqueda]);

  const alGuardar = (texto: string) => {
    setMensaje(texto);
    void cargar();
  };

  const anular = async (usuario: Usuario) => {
    if (!window.confirm(`¿Anular al usuario "${usuario.usuario}"?`)) return;
    try {
      await anularUsuario(usuario.idUsuario);
      setMensaje("Usuario anulado correctamente");
      void cargar();
    } catch (err) {
      setMensaje(mensajeDeError(err, "Error: no se pudo anular el usuario."));
    }
  };

  const columnas: ColumnaTabla<Usuario>[] = [
    { encabezado: "Nombre", valor: (u) => u.nombre },
    { encabezado: "Usuario", valor: (u) => u.usuario },
    { encabezado: "Correo", valor: (u) => u.correo || "—" },
    { encabezado: "Perfil", valor: (u) => u.nombrePerfil ?? "—" },
    {
      encabezado: "Estado",
      valor: (u) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${u.estado
              ? "bg-accent-modern/10 text-accent-modern"
              : "bg-text-muted/15 text-text-muted"
            }`}
        >
          {u.estado ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 font-marmelad">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Usuarios</h1>
          <p className="text-sm font-semibold text-text-muted">
            Personal con acceso al sistema
          </p>
        </div>

        <button
          type="button"
          onClick={() => setUsuarioEnEdicion(USUARIO_VACIO)}
          className="inline-flex items-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </header>

      <Mensaje texto={mensaje} />

      <div className="flex flex-wrap items-center gap-3">
        <BarraBusqueda
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por nombre, usuario, correo o perfil..."
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
          datos={usuariosVisibles}
          claveFila={(u) => u.idUsuario}
          acciones={(u) => (
            <AccionesFila
              onEditar={() => setUsuarioEnEdicion(u)}
              onAnular={() => anular(u)}
            />
          )}
        />
      )}

      <Modal
        abierto={usuarioEnEdicion !== null}
        titulo={usuarioEnEdicion?.idUsuario ? "Editar usuario" : "Nuevo usuario"}
        subtitulo="Completa los datos del usuario"
        icono={UserRound}
        onCerrar={() => setUsuarioEnEdicion(null)}
      >
        {usuarioEnEdicion && (
          <FormularioUsuario
            inicial={usuarioEnEdicion}
            perfiles={perfiles}
            onCerrar={() => setUsuarioEnEdicion(null)}
            onGuardado={alGuardar}
          />
        )}
      </Modal>
    </div>
  );
}

export default Usuarios;