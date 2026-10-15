import { BriefcaseBusiness, LayoutDashboard, Menu, Users, UserRoundCheck, X } from "lucide-react";

const opciones = [
  { id: "dashboard", nombre: "Dashboard", icono: LayoutDashboard },
  { id: "trabajadores", nombre: "Trabajadores", icono: UserRoundCheck },
];

export default function Sidebar({ actual, navegar, abierto, cerrar, }) {
  return <>
    {abierto && <button className="fixed inset-0 z-30 bg-slate-950/50 md:hidden" onClick={cerrar} aria-label="Cerrar menú" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#142D4C] text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${abierto ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-6"><div><p className="text-xl font-extrabold tracking-tight">La Providencia</p><p className="mt-1 text-xs text-slate-300">Sistema de organización</p></div><button onClick={cerrar} className="md:hidden" aria-label="Cerrar menú"><X size={20}/></button></div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Navegación principal">
        <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Administración</p>
        {opciones.map(({ id, nombre, icono: Icono }) => <button key={id} onClick={() => { navegar(id); cerrar(); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${actual === id ? "bg-white text-[#142D4C]" : "text-slate-200 hover:bg-white/10"}`}><Icono size={19}/>{nombre}</button>)}
        <div className="px-3 pt-5 text-xs text-slate-400">Clientes y trabajos: próximos módulos</div>
      </nav>
      <p className="border-t border-white/10 px-5 py-4 text-xs text-slate-400">Panel administrativo · Versión inicial</p>
    </aside>
  </>;
}
