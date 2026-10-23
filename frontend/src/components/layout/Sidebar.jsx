import { LayoutDashboard, Users, UserRoundCheck, X, BriefcaseBusiness, ShieldCheck, FileText } from "lucide-react";
import BrandMark from "../BrandMark";
const opciones = [{id:"dashboard",nombre:"Dashboard",icono:LayoutDashboard},{id:"clientes",nombre:"Clientes",icono:Users},{id:"trabajadores",nombre:"Trabajadores",icono:UserRoundCheck},{id:"trabajos",nombre:"Trabajos",icono:BriefcaseBusiness},{id:"ventas",nombre:"Lápidas",icono:FileText}];
export default function Sidebar({actual,navegar,usuario,abierto,cerrar}) {
  const opcionesVisibles = usuario?.rol === "superadmin" ? [...opciones, {id:"usuarios",nombre:"Usuarios",icono:ShieldCheck}] : opciones;
  return <>
    {abierto && <button className="fixed inset-0 z-30 bg-slate-950/60 md:hidden" onClick={cerrar} aria-label="Cerrar menú"/>}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col text-white shadow-xl transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${abierto?"translate-x-0":"-translate-x-full"}`} style={{background:"linear-gradient(165deg,#fa484d 0%,#934467 36%,#453c72 64%,#09448d 100%)"}}>
      <div className="border-b border-white/20 px-5 pb-6 pt-8">
        <div className="flex justify-end md:hidden"><button onClick={cerrar} aria-label="Cerrar menú"><X size={20}/></button></div>
        <BrandMark/>
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Navegación principal">
        <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-widest text-white/60">Administración</p>
        {opcionesVisibles.map(({id,nombre,icono:Icono})=><button key={id} onClick={()=>{navegar(id);cerrar();}} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${actual===id?"bg-white text-[#273f7c] shadow-md":"text-white/90 hover:bg-white/15"}`}><Icono size={19}/>{nombre}</button>)}
      </nav>
      <p className="border-t border-white/15 px-5 py-4 text-xs text-white/70">Sistema de organización</p>
    </aside>
  </>;
}
