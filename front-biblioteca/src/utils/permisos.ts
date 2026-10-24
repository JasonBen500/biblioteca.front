export type Rol = "administrador" | "bibliotecario";

// Rutas que solo puede abrir el administrador
const RUTAS_SOLO_ADMIN = ["/usuarios", "/perfiles"];

// Solo el perfil llamado "Administrador" tiene permisos totales
export const rolDe = (nombrePerfil?: string): Rol =>
  nombrePerfil?.trim().toLowerCase() === "administrador" ? "administrador" : "bibliotecario";

export const puedeAcceder = (rol: Rol, ruta: string) =>
  rol === "administrador" || !RUTAS_SOLO_ADMIN.includes(ruta);

// Anular libros, socios y préstamos
export const puedeAnular = (rol: Rol) => rol === "administrador";