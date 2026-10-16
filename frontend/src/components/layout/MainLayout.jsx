import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MainLayout({ actual, navegar, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  return (
    <div className="min-h-screen md:flex">
      <Sidebar actual={actual} navegar={navegar} abierto={menuAbierto} cerrar={() => setMenuAbierto(false)}/>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-5 md:px-10">
          <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú"><Menu size={22}/></button>
          <p className="font-semibold text-slate-700">{actual === "dashboard" ? "Panel principal" : "Gestión de trabajadores"}</p>
          <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#124B91]">Administración</span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
