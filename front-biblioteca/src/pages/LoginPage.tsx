import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, KeyRound, LogIn, UserRound } from "lucide-react";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Mensaje from "../components/Mensaje";
import logo from "../assets/images/LogoSimple.png";

const ESTILO_INPUT =
  "w-full rounded-xl border border-border-light bg-bg-surface py-3 pl-11 pr-4 font-marmelad text-sm font-semibold text-text-main placeholder:text-text-muted focus:outline-none";
const ESTILO_LABEL = "mb-1 block font-marmelad text-sm font-extrabold text-text-main";

// Lomos de libros para decorar el estante
const LOMOS = [
  "h-36 w-7 bg-accent-vintage",
  "h-44 w-9 bg-accent-modern",
  "h-32 w-6 bg-papel",
  "h-40 w-8 bg-alert",
  "h-44 w-7 bg-accent-vintage/70",
  "h-36 w-10 bg-white/20",
  "h-40 w-6 bg-accent-modern/70",
  "h-44 w-8 bg-papel/80",
  "h-32 w-7 bg-alert/80",
  "h-40 w-9 bg-accent-vintage",
  "h-36 w-6 bg-white/25",
];

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const respuesta = await login({ usuario, contrasena });
      iniciarSesion(respuesta.data);
      navigate("/");
    } catch {
      setError("Error: usuario o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-bg-main font-marmelad lg:grid-cols-2">
      {/* Panel izquierdo: marca, lema y estante */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-text-main p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-vintage/15 blur-3xl" />

        <div className="relative">
          <img src={logo} alt="Bibliotech" className="h-40 w-56 object-contain" />
          <h1 className="mt-6 max-w-md text-5xl font-black leading-tight">
            Sistemas que organizan{" "}
            <span className="text-accent-vintage">conocimiento</span>
          </h1>
          <p className="mt-4 max-w-md text-sm font-semibold text-white/70">
            Controla el catálogo, los socios y cada préstamo de tu biblioteca desde un solo lugar.
          </p>
        </div>

        <div className="relative flex items-end gap-1.5 border-b-8 border-accent-vintage px-4" aria-hidden="true">
          {LOMOS.map((clases, i) => (
            <div key={i} className={`${clases} rounded-t-md pt-4 shadow-md`}>
              <span className="mx-auto block h-1 w-3/5 rounded-full bg-black/20" />
              <span className="mx-auto mt-2 block h-1 w-3/5 rounded-full bg-black/20" />
            </div>
          ))}
        </div>
      </aside>

      {/* Panel derecho: carné de acceso */}
      <main className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="flex h-20 w-32 items-center justify-center rounded-xl bg-text-main p-2 shadow-md lg:hidden">
          <img src={logo} alt="Bibliotech" className="h-full w-full object-contain" />
        </div>

        <div className="ficha w-full max-w-md overflow-hidden rounded-2xl border-2 border-accent-vintage bg-papel shadow-xl">
          <div className="border-b-4 border-double border-text-main/30 bg-accent-vintage px-8 py-6">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-main/60">
              Carné de acceso · Biblioteca
            </p>
            <h2 className="text-3xl font-black text-text-main">Bienvenido</h2>
            <p className="text-sm font-bold text-text-main/80">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-5 p-8">
            <div className="flex items-center gap-3 text-accent-vintage" aria-hidden="true">
              <span className="h-px flex-1 bg-accent-vintage/40" />
              <BookOpen size={16} />
              <span className="h-px flex-1 bg-accent-vintage/40" />
            </div>

            <Mensaje texto={error} />

            <div>
              <label className={ESTILO_LABEL}>Usuario</label>
              <div className="relative">
                <UserRound
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-accent-vintage"
                />
                <input
                  type="text"
                  placeholder="Tu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className={ESTILO_INPUT}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className={ESTILO_LABEL}>Contraseña</label>
              <div className="relative">
                <KeyRound
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-accent-vintage"
                />
                <input
                  type={verContrasena ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className={`${ESTILO_INPUT} pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerContrasena(!verContrasena)}
                  title={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-text-muted transition-colors hover:bg-text-main/10 hover:text-text-main"
                >
                  {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent-modern px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <LogIn size={18} />
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs font-bold text-text-muted">
          Bibliotech · Sistemas que organizan conocimiento
        </p>
      </main>
    </div>
  );
}