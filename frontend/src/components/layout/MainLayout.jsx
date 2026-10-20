import { useEffect, useState } from "react";
import { obtenerTareas } from "../../modulos/tareas/services/tareasService";
import { Menu, Bell, ShieldCheck, ChevronRight, CalendarClock } from "lucide-react";
import Sidebar from "./Sidebar";
const nombres={dashboard:"Panel principal",clientes:"Gestión de clientes",trabajadores:"Gestión de trabajadores",trabajos:"Gestión de trabajos",ventas:"Registro de lápidas",tareas:"Planificación de tareas"};
export default function MainLayout({actual,navegar,children}) {
  const [menuAbierto,setMenuAbierto]=useState(false);
  const [avisosAbiertos,setAvisosAbiertos]=useState(false);
  const [tareas,setTareas]=useState([]);
  const [errorAvisos,setErrorAvisos]=useState("");
  const cargarAvisos=async()=>{try{const r=await obtenerTareas();setTareas(r.tareas||[]);setErrorAvisos("");}catch(e){setErrorAvisos(e.message||"No se pudieron consultar las tareas.");}};
  useEffect(()=>{cargarAvisos();},[actual]);
  const hoy=new Date();hoy.setHours(12,0,0,0);
  const avisos=tareas.filter(t=>t.estado!=="finalizada").map(t=>({...t,dias:Math.round((new Date(String(t.fechaLimite).slice(0,10)+"T12:00:00")-hoy)/86400000)})).filter(t=>t.dias<=2).sort((a,b)=>a.dias-b.dias);
  const vencidas=avisos.filter(t=>t.dias<0).length;
  return <div className="min-h-screen md:flex app-background">
    <Sidebar actual={actual} navegar={navegar} abierto={menuAbierto} cerrar={()=>setMenuAbierto(false)}/>
    <div className="min-w-0 flex-1">
      <header className="flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/85 px-5 backdrop-blur md:px-10">
        <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={()=>setMenuAbierto(true)} aria-label="Abrir menú"><Menu size={22}/></button>
        <div className="min-w-0"><div className="flex items-center gap-2 text-sm"><span className="hidden font-semibold text-slate-400 sm:inline">Administración</span><ChevronRight size={14} className="hidden text-slate-300 sm:inline"/><span className="truncate font-extrabold text-[#203d6b]">{nombres[actual]}</span></div><p className="hidden text-[11px] text-slate-500 sm:block">La Providencia · Control de operaciones</p></div>
        <div className="ml-auto flex items-center gap-3"><button onClick={()=>navegar("tareas")} title="Consultar tareas y vencimientos" aria-label="Ir a tareas" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#124B91] hover:bg-blue-50"><CalendarClock size={19}/></button><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#123e83] to-[#934467] text-white"><ShieldCheck size={17}/></span><div className="hidden sm:block"><p className="text-xs font-black text-[#203d6b]">Administración</p><p className="text-[10px] text-slate-500">Panel de gestión</p></div></div></div>
      </header>
      <main>{children}</main>
    </div>
  </div>;
}
