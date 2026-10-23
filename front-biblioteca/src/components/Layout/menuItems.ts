import {
  House,
  BookOpen,
  Users,
  ClipboardList,
  ListChecks,
  ChartColumn,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const menuItems: MenuItem[] = [
  { to: "/", label: "Página principal", icon: House },
  { to: "/libros", label: "Libros", icon: BookOpen },
  { to: "/socios", label: "Socios", icon: Users },
  { to: "/prestamos", label: "Préstamos", icon: ClipboardList },
  { to: "/detalle-prestamo", label: "Detalle de préstamo", icon: ListChecks },
  { to: "/reportes", label: "Reportes", icon: ChartColumn },
  { to: "/usuarios", label: "Usuarios", icon: UserRound },
  { to: "/perfiles", label: "Perfiles", icon: ShieldCheck },
];