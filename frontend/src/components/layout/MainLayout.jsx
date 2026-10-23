import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
const nombres={dashboard:"Panel principal",clientes:"Gestión de clientes",trabajadores:"Gestión de trabajadores",trabajos:"Gestión de trabajos",ventas:"Lápidas",usuarios:"Usuarios del sistema"};
export default function MainLayout({actual,navegar,usuario,cerrarSesion,children}) {
  const [menuAbierto,setMenuAbierto]=useState(false);
  return <div className="min-h-screen md:flex app-background">
    <Sidebar actual={actual} navegar={navegar} usuario={usuario} abierto={menuAbierto} cerrar={()=>setMenuAbierto(false)}/>
    <div className="min-w-0 flex-1">
      <header className="flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/85 px-5 backdrop-blur md:px-10">
        <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={()=>setMenuAbierto(true)} aria-label="Abrir menú"><Menu size={22}/></button>
        <p className="font-semibold text-slate-700">{nombres[actual]}</p>
        <span className="ml-auto hidden text-right sm:block">
          <span className="block text-xs font-semibold text-slate-700">{usuario.email}</span>
          <span className="block text-[10px] uppercase tracking-wide text-slate-400">{usuario.rol === "superadmin" ? "Superadmin" : "Usuario"}</span>
        </span>
        <button onClick={cerrarSesion} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-[#a33d63]" aria-label="Cerrar sesión">
          <LogOut size={17}/><span className="hidden sm:inline">Salir</span>
        </button>
      </header>
      <main>{children}</main>
    </div>
  </div>;
}
