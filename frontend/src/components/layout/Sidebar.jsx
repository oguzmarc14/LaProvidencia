import { LayoutDashboard, Users, UserRoundCheck, X, BriefcaseBusiness } from "lucide-react";
const opciones = [{id:"dashboard",nombre:"Dashboard",icono:LayoutDashboard},{id:"clientes",nombre:"Clientes",icono:Users},{id:"trabajadores",nombre:"Trabajadores",icono:UserRoundCheck}];
export default function Sidebar({actual,navegar,abierto,cerrar}) {
  return <>
    {abierto && <button className="fixed inset-0 z-30 bg-slate-950/60 md:hidden" onClick={cerrar} aria-label="Cerrar menú"/>}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col text-white shadow-xl transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${abierto?"translate-x-0":"-translate-x-full"}`} style={{background:"linear-gradient(165deg,#fa484d 0%,#934467 36%,#453c72 64%,#09448d 100%)"}}>
      <div className="border-b border-white/20 px-5 pb-6 pt-8">
        <div className="flex justify-end md:hidden"><button onClick={cerrar} aria-label="Cerrar menú"><X size={20}/></button></div>
        <div className="mb-4 flex justify-center"><svg width="65" height="84" viewBox="0 0 65 84" fill="none" aria-hidden="true"><path d="M8 82V46L20 40V82M23 82V18L38 10V82M41 82V34L53 40V82M56 82V57L63 62V82" stroke="white" strokeWidth="3" fill="white" fillOpacity=".16"/><path d="M3 83H65" stroke="white" strokeWidth="2"/></svg></div>
        <p className="text-center text-[10px] font-bold tracking-wide text-white/90">ENCIMERAS DE MÁRMOL Y GRANITO</p>
        <p className="mt-2 text-center font-serif text-[23px] tracking-[.12em]">LA PROVIDENCIA</p>
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Navegación principal">
        <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-widest text-white/60">Administración</p>
        {opciones.map(({id,nombre,icono:Icono})=><button key={id} onClick={()=>{navegar(id);cerrar();}} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${actual===id?"bg-white text-[#273f7c] shadow-md":"text-white/90 hover:bg-white/15"}`}><Icono size={19}/>{nombre}</button>)}
        <div className="px-3 pt-4 text-xs text-white/60"><BriefcaseBusiness size={14} className="mr-2 inline"/> Trabajos: módulo en preparación</div>
      </nav>
      <p className="border-t border-white/15 px-5 py-4 text-xs text-white/70">Sistema de organización</p>
    </aside>
  </>;
}
