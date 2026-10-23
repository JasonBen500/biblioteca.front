import { useState, type ReactNode } from "react";
import {
  BookMarked,
  BookOpen,
  BookText,
  ClipboardList,
  Library,
  ListChecks,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import TarjetaReporte from "../components/reportes/TarjetaReporte";
import Mensaje from "../components/Mensaje";
import { useDatosReportes } from "../hooks/useDatosReportes";
import type { FiltroEstado } from "../utils/estados";
import {
  reporteDetallePrestamo,
  reporteLibros,
  reportePerfiles,
  reportePrestamos,
  reporteSocios,
  reporteUsuarios,
  type DefinicionReporte,
} from "../utils/reportes";

const OPCIONES_FILTRO: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: "activos", etiqueta: "Activos" },
  { valor: "inactivos", etiqueta: "Inactivos" },
  { valor: "todos", etiqueta: "Todos" },
];

interface PropsSeccion {
  titulo: string;
  subtitulo: string;
  icono: LucideIcon;
  children: ReactNode;
}

function Seccion({ titulo, subtitulo, icono: Icono, children }: PropsSeccion) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text-main text-bg-main">
          <Icono size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-text-main">{titulo}</h2>
          <p className="text-xs font-semibold text-text-muted">{subtitulo}</p>
        </div>
        <div className="ml-2 hidden h-px flex-1 bg-border-light sm:block" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

interface PropsDato {
  etiqueta: string;
  valor: number | string;
}

function DatoResumen({ etiqueta, valor }: PropsDato) {
  return (
    <div className="rounded-2xl border border-border-light bg-bg-surface px-4 py-3 text-center shadow-sm">
      <p className="text-2xl font-black text-text-main">{valor}</p>
      <p className="text-xs font-bold text-text-muted">{etiqueta}</p>
    </div>
  );
}

function Reportes() {
  const datos = useDatosReportes();
  const { cargando, error } = datos;
  const [filtro, setFiltro] = useState<FiltroEstado>("activos");

  const resumen = (valor: number) => (cargando || error ? "…" : valor);

  // Arma una ficha. El tipo genérico T hace que TypeScript compruebe que el
  // reporte y la lista de registros pertenecen a la misma entidad.
  const tarjeta = <T extends { estado: boolean }>(
    nombre: string,
    ficha: string,
    descripcion: string,
    icono: LucideIcon,
    reporte: DefinicionReporte<T>,
    registros: T[],
  ) => (
    <TarjetaReporte
      key={nombre}
      nombre={nombre}
      ficha={ficha}
      descripcion={descripcion}
      icono={icono}
      reporte={reporte}
      registros={registros}
      filtro={filtro}
      cargando={cargando}
      error={error !== ""}
    />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 font-marmelad md:p-10">
      {/* Encabezado de catálogo */}
      <header className="overflow-hidden rounded-3xl border border-border-light bg-bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-4 bg-text-main px-6 py-6 text-bg-main md:px-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-vintage text-text-main">
            <Library size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-widest text-accent-vintage">
              Archivo de la biblioteca
            </p>
            <h1 className="text-3xl font-black md:text-4xl">Catálogo de reportes</h1>
          </div>
        </div>
        <p className="px-6 py-4 text-sm font-semibold text-text-muted md:px-8">
          Consulta o descarga en PDF o Excel la ficha de cada módulo. Elige si
          quieres los registros activos, los inactivos (anulados) o todos. En el
          detalle de préstamos, activos son los libros pendientes de devolución e
          inactivos los ya devueltos.
        </p>
      </header>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DatoResumen
          etiqueta="Libros en catálogo"
          valor={resumen(datos.libros.filter((l) => l.estado).length)}
        />
        <DatoResumen
          etiqueta="Socios activos"
          valor={resumen(datos.socios.filter((s) => s.estado).length)}
        />
        <DatoResumen
          etiqueta="Préstamos vigentes"
          valor={resumen(datos.prestamos.filter((p) => p.estado).length)}
        />
        <DatoResumen
          etiqueta="Libros por devolver"
          valor={resumen(datos.detalles.filter((d) => d.estado).length)}
        />
      </div>

      {/* Selector de estado */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-extrabold text-text-main">Mostrar en reportes:</span>
        <div className="inline-flex rounded-full border border-border-light bg-bg-surface p-1">
          {OPCIONES_FILTRO.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              aria-pressed={filtro === valor}
              onClick={() => setFiltro(valor)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                filtro === valor
                  ? "bg-text-main text-white"
                  : "text-text-main hover:bg-text-main/10"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      <Mensaje texto={error} />

      <Seccion
        titulo="Colección"
        subtitulo="Los libros que guarda la biblioteca"
        icono={BookText}
      >
        {tarjeta(
          "Libros",
          "Ficha 01",
          "Título, autor, ISBN y ejemplares disponibles.",
          BookOpen,
          reporteLibros,
          datos.libros,
        )}
      </Seccion>

      <Seccion
        titulo="Circulación"
        subtitulo="Lo que sale y vuelve a los estantes"
        icono={BookMarked}
      >
        {tarjeta(
          "Préstamos",
          "Ficha 02",
          "Quién se llevó libros, cuándo y para qué fecha.",
          ClipboardList,
          reportePrestamos,
          datos.prestamos,
        )}
        {tarjeta(
          "Detalle de préstamos",
          "Ficha 03",
          "Cada libro prestado y su devolución real.",
          ListChecks,
          reporteDetallePrestamo,
          datos.detalles,
        )}
      </Seccion>

      <Seccion
        titulo="Comunidad y personal"
        subtitulo="Lectores y equipo que atiende el mostrador"
        icono={Users}
      >
        {tarjeta(
          "Socios",
          "Ficha 04",
          "Lectores registrados con su carnet y préstamos.",
          Users,
          reporteSocios,
          datos.socios,
        )}
        {tarjeta(
          "Usuarios",
          "Ficha 05",
          "Personal con acceso al sistema.",
          UserRound,
          reporteUsuarios,
          datos.usuarios,
        )}
        {tarjeta(
          "Perfiles",
          "Ficha 06",
          "Roles y permisos del personal.",
          ShieldCheck,
          reportePerfiles,
          datos.perfiles,
        )}
      </Seccion>
    </div>
  );
}

export default Reportes;