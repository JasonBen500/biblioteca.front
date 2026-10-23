import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-bg-main min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
