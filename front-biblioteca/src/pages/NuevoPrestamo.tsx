import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import type { Socio } from "../types/Socio";
import type { Libro } from "../types/Libro";
import { buscarSocios, crearSocio } from "../services/sociosSsrvice";
import { getLibros } from "../services/librosService";
import { crearPrestamo } from "../services/prestamosService";
import { crearDetallePrestamo } from "../services/detallePrestamoService";

export default function NuevoPrestamo() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // --- Socio ---
  const [tipoSocio, setTipoSocio] = useState<"existente" | "nuevo">(
    "existente",
  );
  const [busquedaSocio, setBusquedaSocio] = useState("");
  const busquedaDebounced = useDebounce(busquedaSocio, 400);
  const [resultadosSocio, setResultadosSocio] = useState<Socio[]>([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState<Socio | null>(
    null,
  );
  const [nuevoSocio, setNuevoSocio] = useState({
    nombre: "",
    carnet: "",
    telefono: "",
  });

  // --- Libros ---
  const [tipoLibros, setTipoLibros] = useState<"uno" | "varios">("uno");
  const [libros, setLibros] = useState<Libro[]>([]);
  const [librosSeleccionados, setLibrosSeleccionados] = useState<number[]>([]);

  // --- Fechas ---
  const hoy = new Date().toISOString().split("T")[0];
  const [fechaPrestamo, setFechaPrestamo] = useState(hoy);
  const [fechaDevolucionEsperada, setFechaDevolucionEsperada] = useState("");

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    getLibros().then((res) => setLibros(res.data));
  }, []);

  useEffect(() => {
    if (tipoSocio === "existente" && busquedaDebounced.trim().length > 0) {
      buscarSocios(busquedaDebounced).then((res) =>
        setResultadosSocio(res.data),
      );
    } else {
      setResultadosSocio([]);
    }
  }, [busquedaDebounced, tipoSocio]);

  const toggleLibro = (idLibro: number) => {
    if (tipoLibros === "uno") {
      setLibrosSeleccionados([idLibro]);
    } else {
      setLibrosSeleccionados((prev) =>
        prev.includes(idLibro)
          ? prev.filter((id) => id !== idLibro)
          : [...prev, idLibro],
      );
    }
  };

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usuario) {
      setError("No hay sesión activa");
      return;
    }
    if (librosSeleccionados.length === 0) {
      setError("Selecciona al menos un libro");
      return;
    }

    setGuardando(true);
    try {
      let idSocio = socioSeleccionado?.idSocio ?? 0;

      if (tipoSocio === "nuevo") {
        const resSocio = await crearSocio({
          idSocio: 0,
          estado: true,
          ...nuevoSocio,
        });
        idSocio = resSocio.data.idSocio;
      }

      if (!idSocio) {
        setError("Selecciona o registra un socio");
        setGuardando(false);
        return;
      }

      const resPrestamo = await crearPrestamo({
        idPrestamo: 0,
        idSocio,
        idUsuario: usuario.idUsuario,
        fechaPrestamo,
        fechaDevolucionEsperada,
        estado: true,
      });
      const idPrestamo = resPrestamo.data.idPrestamo;

      for (const idLibro of librosSeleccionados) {
        await crearDetallePrestamo({
          idDetallePrestamo: 0,
          idPrestamo,
          idLibro,
          fechaDevolucionReal: "",
        });
      }

      navigate("/prestamos");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Error al registrar el préstamo",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Nuevo Préstamo</h1>

      <form
        onSubmit={manejarSubmit}
        className="bg-white p-6 rounded shadow space-y-6 max-w-2xl"
      >
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* SOCIO */}
        <div>
          <label className="block font-semibold mb-2">Socio</label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={tipoSocio === "existente"}
                onChange={() => {
                  setTipoSocio("existente");
                  setSocioSeleccionado(null);
                }}
              />
              Existente
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={tipoSocio === "nuevo"}
                onChange={() => {
                  setTipoSocio("nuevo");
                  setSocioSeleccionado(null);
                }}
              />
              Agregar Nuevo
            </label>
          </div>

          {tipoSocio === "existente" ? (
            <div>
              {socioSeleccionado ? (
                <div className="flex items-center justify-between border rounded px-3 py-2 bg-slate-50">
                  <span>{socioSeleccionado.nombre}</span>
                  <button
                    type="button"
                    onClick={() => setSocioSeleccionado(null)}
                    className="text-red-600 text-sm"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Buscar socio por nombre..."
                    value={busquedaSocio}
                    onChange={(e) => setBusquedaSocio(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  {resultadosSocio.length > 0 && (
                    <div className="border rounded mt-1 max-h-40 overflow-y-auto">
                      {resultadosSocio.map((s) => (
                        <div
                          key={s.idSocio}
                          onClick={() => {
                            setSocioSeleccionado(s);
                            setBusquedaSocio("");
                          }}
                          className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                        >
                          {s.nombre} — {s.carnet}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoSocio.nombre}
                onChange={(e) =>
                  setNuevoSocio({ ...nuevoSocio, nombre: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Carnet"
                value={nuevoSocio.carnet}
                onChange={(e) =>
                  setNuevoSocio({ ...nuevoSocio, carnet: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={nuevoSocio.telefono}
                onChange={(e) =>
                  setNuevoSocio({ ...nuevoSocio, telefono: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
            </div>
          )}
        </div>

        {/* LIBROS */}
        <div>
          <label className="block font-semibold mb-2">Libros</label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={tipoLibros === "uno"}
                onChange={() => {
                  setTipoLibros("uno");
                  setLibrosSeleccionados([]);
                }}
              />
              Un libro
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={tipoLibros === "varios"}
                onChange={() => {
                  setTipoLibros("varios");
                  setLibrosSeleccionados([]);
                }}
              />
              Más de uno
            </label>
          </div>

          <div className="border rounded max-h-56 overflow-y-auto divide-y">
            {libros.map((l) => {
              const disponible = l.ejemplaresDisponibles > 0;
              const seleccionado = librosSeleccionados.includes(l.idLibro);
              return (
                <div
                  key={l.idLibro}
                  onClick={() => disponible && toggleLibro(l.idLibro)}
                  className={`flex items-center justify-between px-3 py-2 ${
                    disponible
                      ? "cursor-pointer hover:bg-slate-50"
                      : "opacity-50 cursor-not-allowed"
                  } ${seleccionado ? "bg-emerald-50" : ""}`}
                >
                  <span>{l.titulo}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${disponible ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FECHAS */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Fecha de préstamo</label>
            <input
              type="date"
              value={fechaPrestamo}
              onChange={(e) => setFechaPrestamo(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Devolución esperada</label>
            <input
              type="date"
              value={fechaDevolucionEsperada}
              onChange={(e) => setFechaDevolucionEsperada(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Registrar Préstamo"}
        </button>
      </form>
    </Layout>
  );
}
