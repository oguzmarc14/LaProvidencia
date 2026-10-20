import { useEffect, useMemo, useState } from "react";
import { X, UserRound, MessageCircle, MapPin, BriefcaseBusiness, Clock3, CheckCircle2, Plus, Pencil, CalendarDays, ArrowUpRight, Banknote } from "lucide-react";
import { obtenerTrabajos } from "../../trabajos/services/trabajosService";
import { enlaceWhatsApp } from "../utils/enlacesCliente";

const estados = { templado: "Templado", fabricacion: "Fabricación", detallado: "Detallado", instalacion: "Instalación", finalizado: "Finalizado" };
const fecha = valor => valor ? new Date(valor).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "Sin fecha";

export default function DetalleCliente({ cliente, onClose, onEditar, onNuevoTrabajo, onAbrirTrabajo, trabajos: trabajosExternos }) {
  const [trabajosCargados, setTrabajosCargados] = useState([]);
  const [cargando, setCargando] = useState(!trabajosExternos);
  const [error, setError] = useState("");
  const [pestana, setPestana] = useState("trabajos");
  useEffect(() => {
    if (trabajosExternos) return;
    let activo = true;
    obtenerTrabajos().then(r => { if (activo) setTrabajosCargados(r.trabajos || []); })
      .catch(e => { if (activo) setError(e.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [trabajosExternos]);
  useEffect(() => {
    const cerrar = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", cerrar);
    return () => document.removeEventListener("keydown", cerrar);
  }, [onClose]);
  const historial = useMemo(() => (trabajosExternos || trabajosCargados).filter(t => String(t.cliente?._id || t.cliente || "") === String(cliente._id)), [trabajosExternos, trabajosCargados, cliente._id]);
  const activos = historial.filter(t => t.estado !== "finalizado");
  const terminados = historial.filter(t => t.estado === "finalizado");
  const conPrecio = historial.filter(t => t.precioTotal != null && Number.isFinite(Number(t.precioTotal)));
  const total = conPrecio.reduce((s,t) => s + Number(t.precioTotal), 0);
  const whatsapp = enlaceWhatsApp(cliente.whatsapp);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:p-5" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={`Detalles de ${cliente.nombre}`} className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(92vh,850px)] sm:rounded-3xl">
      <header className="shrink-0 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] px-5 py-5 text-white sm:px-7">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20"><UserRound size={26}/></div>
          <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-widest text-white/75">Ficha del cliente</p><h2 className="mt-1 break-words text-xl font-extrabold sm:text-2xl">{cliente.nombre}</h2></div>
          <button type="button" aria-label="Cerrar detalles del cliente" onClick={onClose} className="rounded-xl p-2 hover:bg-white/20"><X size={22}/></button>
        </div>
      </header>
      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          {[[historial.length,"Trabajos totales",BriefcaseBusiness],[activos.length,"Trabajos activos",Clock3],[terminados.length,"Finalizados",CheckCircle2],[historial.length ? Math.round(terminados.length / historial.length * 100) + "%" : "0%","Porcentaje finalizado",CheckCircle2]].map(([valor,titulo,Icono],i) => <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><Icono size={18} className="mb-2 text-[#124B91]"/><p className="text-2xl font-black text-slate-900">{cargando ? "—" : valor}</p><p className="text-xs font-semibold text-slate-500">{titulo}</p></div>)}
        </div>
        <div className="flex flex-wrap gap-2">
          {whatsapp ? <a href={whatsapp + "?text=" + encodeURIComponent(`Hola, ${cliente.nombre}. Te contactamos de La Providencia.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"><MessageCircle size={17}/> Enviar WhatsApp</a> : <span className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Sin WhatsApp válido</span>}
          {onNuevoTrabajo && <button onClick={() => onNuevoTrabajo(cliente)} className="inline-flex items-center gap-2 rounded-xl bg-[#124B91] px-4 py-3 text-sm font-bold text-white hover:bg-blue-900"><Plus size={17}/> Nuevo trabajo</button>}
          {onEditar && <button onClick={() => onEditar(cliente)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><Pencil size={17}/> Editar</button>}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <h3 className="font-extrabold text-slate-900">Información de contacto</h3>
          <p className="flex items-center gap-2 break-words text-sm text-slate-700"><MessageCircle size={17} className="shrink-0 text-[#124B91]"/>{cliente.whatsapp || "Sin número registrado"}</p>
          <p className="flex items-start gap-2 break-words text-sm text-slate-700"><MapPin size={17} className="shrink-0 text-[#124B91]"/>{cliente.direccion || "Sin dirección registrada"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="mb-1 flex items-center gap-2 font-extrabold text-slate-900"><Banknote size={18} className="text-[#124B91]"/> Valor registrado de trabajos</p>
          <p className="text-2xl font-black text-slate-900">{cargando ? "—" : total.toLocaleString("es-MX", { style:"currency", currency:"MXN" })}</p>
          <p className="mt-1 text-xs text-slate-500">Suma de precios registrados ({conPrecio.length} de {historial.length} trabajos). No representa pagos recibidos.</p>
        </div>
        <div className="flex gap-2 border-b border-slate-200">
          <button onClick={() => setPestana("trabajos")} className={`border-b-2 px-3 py-3 text-sm font-bold ${pestana === "trabajos" ? "border-[#124B91] text-[#124B91]" : "border-transparent text-slate-500"}`}>Historial de trabajos</button>
          <button onClick={() => setPestana("actividad")} className={`border-b-2 px-3 py-3 text-sm font-bold ${pestana === "actividad" ? "border-[#124B91] text-[#124B91]" : "border-transparent text-slate-500"}`}>Resumen</button>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {cargando ? <p className="text-sm text-slate-500">Cargando historial...</p> : pestana === "trabajos" ? <div className="space-y-3">
          {!historial.length && <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Este cliente aún no tiene trabajos registrados.</p>}
          {historial.map(t => <div key={t._id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><p className="min-w-0 flex-1 break-words font-bold text-slate-900">{t.nombre}</p><span className={`rounded-full px-3 py-1 text-xs font-bold ${t.estado === "finalizado" ? "bg-emerald-100 text-emerald-800" : "bg-blue-50 text-[#124B91]"}`}>{estados[t.estado] || t.estado}</span></div>
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14}/> Entrega: {fecha(t.fechaFinal)}</p>
            {onAbrirTrabajo && <button onClick={() => onAbrirTrabajo(t)} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#124B91] hover:underline">Abrir trabajo <ArrowUpRight size={15}/></button>}
          </div>)}
        </div> : <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><p><strong>Trabajos activos:</strong> {activos.length}</p><p><strong>Trabajos finalizados:</strong> {terminados.length}</p><p><strong>Último trabajo:</strong> {historial[0]?.nombre || "Sin registros"}</p><p className="text-xs text-slate-500">El resumen se calcula con los trabajos registrados, sin inventar eventos de actividad.</p></div>}
      </div>
    </section>
  </div>;
}
