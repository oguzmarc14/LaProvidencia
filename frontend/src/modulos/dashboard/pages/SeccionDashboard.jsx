import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, RefreshCw, Users, UserRoundCheck } from "lucide-react";
import { obtenerResumenDashboard } from "../services/dashboardService";
import TarjetaResumen from "../components/TarjetaResumen";
import EstadosTrabajos from "../components/EstadosTrabajos";

export default function SeccionDashboard({ navegar }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    try { setDatos(await obtenerResumenDashboard()); }
    catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  const resumen = datos?.resumen;
  return (
    <section className="mx-auto max-w-7xl p-5 md:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-[#124B91]">Panel de control</p><h1 className="mt-1 text-3xl font-extrabold text-slate-900">Resumen general</h1><p className="mt-2 text-slate-500">Actividad y seguimiento de La Providencia</p></div>
        <button onClick={cargar} disabled={cargando} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16}/> Actualizar</button>
      </div>
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}. Comprueba que Express y MongoDB estén funcionando.</div>}
      {cargando ? <p className="py-16 text-center text-slate-500">Cargando datos reales del sistema...</p> : resumen && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TarjetaResumen titulo="Clientes registrados" valor={resumen.totalClientes} detalle="Total de clientes" icono={Users}/>
          <TarjetaResumen titulo="Trabajos registrados" valor={resumen.totalTrabajos} detalle="Todos los trabajos" icono={BriefcaseBusiness} color="violet"/>
          <TarjetaResumen titulo="Trabajos sin finalizar" valor={resumen.enProceso} detalle="Pendientes de finalizar" icono={RefreshCw} color="amber"/>
          <TarjetaResumen titulo="Trabajadores activos" valor={resumen.trabajadoresActivos} detalle={`De ${resumen.totalTrabajadores} registrados`} icono={UserRoundCheck} color="emerald"/>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <EstadosTrabajos estados={datos.porEstado} total={resumen.totalTrabajos}/>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Trabajos recientes</h2><p className="mt-1 text-sm text-slate-500">Últimos registros</p></div><CheckCircle2 className="text-emerald-600" size={22}/></div>
            {datos.trabajosRecientes.length === 0 ? <p className="mt-6 text-sm text-slate-500">Aún no hay trabajos registrados.</p> :
              <div className="mt-5 divide-y divide-slate-100">{datos.trabajosRecientes.map((t) =>
                <div key={t._id} className="flex items-center justify-between gap-4 py-3">
                  <div><p className="font-semibold text-slate-800">{t.nombre}</p><p className="text-xs capitalize text-slate-500">{t.material || "Sin material"}</p></div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-800">{t.estado || "Sin estado"}</span>
                </div>)}</div>}
          </section>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">Administración de personal</p><p className="text-sm text-slate-500">Registra trabajadores, edita sus datos y consulta asignaciones.</p></div><button onClick={() => navegar("trabajadores")} className="flex items-center gap-2 rounded-xl bg-[#124B91] px-4 py-2 text-sm font-semibold text-white">Ir a trabajadores <ArrowRight size={16}/></button></div>
        </div>
      </>}
    </section>
  );
}
