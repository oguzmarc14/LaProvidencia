import { Layers3 } from "lucide-react";
const etapas = { templado: "Templado", fabricacion: "Fabricación", detallado: "Detallado", instalacion: "Instalación", finalizado: "Finalizado" };
const colores = { templado: "bg-amber-500", fabricacion: "bg-violet-600", detallado: "bg-sky-500", instalacion: "bg-indigo-600", finalizado: "bg-emerald-600" };
export default function EstadosTrabajos({ estados = [], total = 0 }) {
  return <section className="rounded-[24px] border border-[#cbd4e6] bg-white p-6 shadow-[0_10px_28px_rgba(25,45,90,.09)]">
    <div className="flex items-center gap-3"><span className="rounded-xl bg-purple-100 p-3 text-[#64417c]"><Layers3 size={23}/></span><div><h2 className="text-xl font-extrabold text-slate-900">Trabajos por etapa</h2><p className="mt-1 text-sm text-slate-500">Distribución de los trabajos registrados</p></div></div>
    {estados.length === 0 ? <p className="mt-7 rounded-xl bg-slate-50 p-6 text-center text-slate-500">Aún no hay trabajos registrados.</p> :
      <div className="mt-7 space-y-5">{estados.map(item => <div key={item.estado}>
        <div className="mb-2 flex justify-between gap-2 text-sm"><span className="font-bold text-[#344766]">{etapas[item.estado] || item.estado}</span><span className="font-extrabold text-slate-900">{item.total} <span className="font-medium text-slate-400">({total ? Math.round(item.total / total * 100) : 0}%)</span></span></div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${colores[item.estado] || "bg-[#124B91]"}`} style={{width:`${total ? item.total / total * 100 : 0}%`}}/></div>
      </div>)}</div>}
  </section>;
}
