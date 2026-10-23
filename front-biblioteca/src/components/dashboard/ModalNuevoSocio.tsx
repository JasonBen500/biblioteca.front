import { useState, type FormEvent } from "react";
import axios from "axios";
import { UserPlus } from "lucide-react";
import Modal from "../Modal";
import Mensaje from "../Mensaje";
import { crearSocio } from "../../services/sociosSsrvice";
import type { Socio } from "../../types/Socio";

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

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

interface PropsFormulario {
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

function FormularioNuevoSocio({ onCerrar, onGuardado }: PropsFormulario) {
  const [form, setForm] = useState<Socio>(SOCIO_VACIO);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

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
      await crearSocio({
        ...form,
        nombre: form.nombre.trim(),
        carnet: form.carnet.trim(),
        telefono: form.telefono.trim(),
      });
      onGuardado("Socio creado correctamente");
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
          {guardando ? "Guardando..." : "Guardar socio"}
        </button>
      </div>
    </form>
  );
}

function ModalNuevoSocio({ abierto, onCerrar, onGuardado }: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo="Nuevo socio"
      subtitulo="Registra un nuevo lector de la biblioteca"
      icono={UserPlus}
      onCerrar={onCerrar}
    >
      {abierto && <FormularioNuevoSocio onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  );
}

export default ModalNuevoSocio;