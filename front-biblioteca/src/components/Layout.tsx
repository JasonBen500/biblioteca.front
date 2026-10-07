import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-slate-100 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
