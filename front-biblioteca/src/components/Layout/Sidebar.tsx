import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { menuItems } from "./menuItems";
import logo from "../../assets/images/LogoSimple.png";

const cx = (...clases: (string | false)[]) => clases.filter(Boolean).join(" ");

// Las dos esquinas curvas que unen la pestaña activa con el contenido de la página
const curvasPestana =
  "before:absolute before:-top-5 before:right-0 before:h-5 before:w-5 before:content-[''] before:rounded-br-[20px] before:shadow-[5px_5px_0_5px_var(--color-bg-main)] " +
  "after:absolute after:-bottom-5 after:right-0 after:h-5 after:w-5 after:content-[''] after:rounded-tr-[20px] after:shadow-[5px_-5px_0_5px_var(--color-bg-main)]";

function Sidebar() {
  const [abierto, setAbierto] = useState(
    () => localStorage.getItem("sidebar-abierto") !== "false",
  );
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("sidebar-abierto", String(abierto));
  }, [abierto]);

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside
      className={cx(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-text-main text-white transition-all duration-75",
        abierto ? "w-64" : "w-20",
      )}
    >
      {/* Logo y botón para abrir/cerrar */}
      <div className="flex flex-col items-center gap-1 px-3 pt-5 pb-4">
        <img
          src={logo}
          alt="Bibliotech"
          className={cx(
            "object-contain transition-all duration-75",
            abierto ? "h-24 w-44" : "h-12 w-14",
          )}
        />
        <button
          onClick={() => setAbierto(!abierto)}
          title={abierto ? "Ocultar menú" : "Mostrar menú"}
          className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {abierto ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      {/* Opciones del menú */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden py-6 pl-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menuItems.map(({ to, label, icon: Icono }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={abierto ? undefined : label}
            className={({ isActive }) =>
              cx(
                "group relative flex items-center rounded-l-full py-1.5 pl-1.5 pr-4 font-marmelad text-sm font-semibold transition-colors",
                isActive ? `bg-bg-main ${curvasPestana}` : "text-white/80 hover:text-white",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cx(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "bg-accent-vintage text-white ring-4 ring-text-main"
                      : "group-hover:bg-white/10",
                  )}
                >
                  <Icono size={20} />
                </span>
                {abierto && (
                  <span
                    className={cx(
                      "ml-3 truncate",
                      isActive && "font-extrabold text-accent-vintage",
                    )}
                  >
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Usuario y cerrar sesión, siempre al final */}
      <div className="border-t border-white/15 px-3 py-4">
        {usuario && (
          <div
            className={cx("mb-3 flex items-center gap-3", !abierto && "justify-center")}
            title={abierto ? undefined : usuario.nombre}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-vintage font-marmelad text-lg font-extrabold text-white">
              {inicial}
            </span>
            {abierto && (
              <div className="min-w-0 font-marmelad text-sm">
                <p className="truncate font-semibold">{usuario.nombre}</p>
                <p className="truncate text-white/60">{usuario.nombrePerfil}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className={cx(
            "flex items-center gap-3 rounded-full font-marmelad text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white",
            abierto ? "w-full px-3 py-3" : "mx-auto h-11 w-11 justify-center",
          )}
        >
          <LogOut size={20} />
          {abierto && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;