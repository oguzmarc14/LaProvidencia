import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, RefreshCw, Users, UserRoundCheck, LayoutDashboard, Plus, Activity } from "lucide-react";
import { obtenerResumenDashboard } from "../services/dashboardService";
import TarjetaResumen from "../components/TarjetaResumen";
import EstadosTrabajos from "../components/EstadosTrabajos";

const nombres = {templado:"Templado",fabricacion:"Fabricación",detallado:"Detallado",instalacion:"Instalación",finalizado:"Finalizado"};
export default function SeccionDashboard({ navegar }) {
  const [datos,setDatos] = useState(null);
  const [cargando,setCargando] = useState(true);
  const [error,setError] = useState("");
  async function cargar() {
    setCargando(true); setError("");
    try { setDatos(await obtenerResumenDashboard()); }
    catch(e) { setError(e.message); }
    finally { setCargando(false); }
  }
  useEffect(() => { cargar(); }, []);
  const resumen = datos?.resumen;
  return <section className="mx-auto max-w-7xl p-4 pb-12 sm:p-6 lg:p-10">
    <div className="mb-7 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white shadow-[0_18px_40px_rgba(43,46,101,.2)] sm:p-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-white/75"><LayoutDashboard size={16}/> Centro de operaciones</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">La Providencia</h1><p className="mt-3 max-w-xl text-base text-white/85">Controla la producción, los clientes y el equipo de La Providencia desde un solo lugar.</p></div>
        <button onClick={cargar} disabled={cargando} className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-4 py-3 text-sm font-bold text-white hover:bg-white/25 disabled:opacity-50"><RefreshCw size={17} className={cargando ? "animate-spin" : ""}/> Actualizar datos</button>
      </div>
      <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => navegar("trabajos")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-[#123e83] shadow-sm hover:bg-blue-50"><Plus size={18}/> Gestionar trabajos <ArrowRight size={16}/></button><button onClick={() => navegar("clientes")} className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-bold hover:bg-white/15"><Users size={18}/> Ver clientes</button></div>
    </div>
    {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">{error}. Comprueba que Express y MongoDB estén funcionando.</div>}
    {cargando ? <div className="rounded-2xl border border-[#cbd4e6] bg-white p-16 text-center font-semibold text-slate-500">Cargando información del sistema...</div> : resumen && <>
      <div className="mb-5 flex items-center gap-2"><Activity size={20} className="text-[#124B91]"/><h2 className="text-lg font-extrabold text-[#233d65]">Indicadores principales</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen titulo="Clientes registrados" valor={resumen.totalClientes} detalle="Clientes en el directorio" icono={Users}/>
        <TarjetaResumen titulo="Trabajos registrados" valor={resumen.totalTrabajos} detalle="Total de proyectos" icono={BriefcaseBusiness} color="violet"/>
        <TarjetaResumen titulo="Trabajos sin finalizar" valor={resumen.enProceso} detalle="Pendientes de entrega" icono={RefreshCw} color="amber"/>
        <TarjetaResumen titulo="Trabajadores activos" valor={resumen.trabajadoresActivos} detalle={`De ${resumen.totalTrabajadores} registrados`} icono={UserRoundCheck} color="emerald"/>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <EstadosTrabajos estados={datos.porEstado || []} total={resumen.totalTrabajos}/>
        <section className="brand-card">
          <div className="p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-100 p-3 text-[#124B91]"><CheckCircle2 size={23}/></span><div><h2 className="text-xl font-extrabold text-slate-900">Trabajos recientes</h2><p className="mt-1 text-sm text-slate-500">Últimos movimientos registrados</p></div></div>
          {!datos.trabajosRecientes?.length ? <p className="mt-7 rounded-xl bg-slate-50 p-6 text-center text-slate-500">Aún no hay trabajos registrados.</p> :
            <div className="mt-5 space-y-3">{datos.trabajosRecientes.map(t => <div key={t._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-[#f7f9fd] p-4"><div className="min-w-0"><p className="truncate font-extrabold text-slate-800">{t.nombre}</p><p className="mt-1 text-xs font-medium capitalize text-slate-500">{t.material || "Sin material"}</p></div><span className="shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-[#124B91]">{nombres[t.estado] || t.estado || "Sin estado"}</span></div>)}</div>}
          <button onClick={() => navegar("trabajos")} className="mt-5 flex items-center gap-2 text-sm font-extrabold text-[#124B91] hover:underline">Ver todos los trabajos <ArrowRight size={16}/></button>
        </section>
      </div>
      <div className="brand-card mt-7"><div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-white to-[#f3edf8] p-6"><div><h2 className="text-lg font-extrabold text-[#233d65]">Administración de personal</h2><p className="mt-1 text-sm text-slate-600">Registra trabajadores, actualiza sus datos y revisa sus asignaciones.</p></div><button onClick={() => navegar("trabajadores")} className="app-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold">Ir a trabajadores <ArrowRight size={17}/></button></div></div>
    </>}
  </section>;
}
