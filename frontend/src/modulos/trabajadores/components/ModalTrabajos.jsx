import { useEffect, useMemo, useState } from "react";
import { X, BriefcaseBusiness, Clock3, CheckCircle2, CalendarDays, UserRound, Layers3, ChevronDown, ChevronUp, Timer, ClipboardList, MapPin, Ruler, ExternalLink } from "lucide-react";
import { obtenerTrabajosDeTrabajador } from "../services/trabajadoresService";
import { enlaceMaps } from "../../clientes/utils/enlacesCliente";

const etapas = ["templado", "fabricacion", "detallado", "instalacion", "finalizado"];
const nombres = { templado: "Templado", fabricacion: "Fabricación", detallado: "Detallado", instalacion: "Instalación", finalizado: "Finalizado" };
const fecha = valor => valor ? new Date(valor).toLocaleDateString("es-MX", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }) : "Sin registrar";

export default function ModalTrabajos({ trabajador, onClose }) {
  const [trabajos, setTrabajos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("activos");
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    obtenerTrabajosDeTrabajador(trabajador._id)
      .then(datos => { if (vigente) setTrabajos(datos.trabajos || []); })
      .catch(e => { if (vigente) setError(e.message); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [trabajador._id]);

  useEffect(() => {
    const alTeclado = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", alTeclado);
    return () => document.removeEventListener("keydown", alTeclado);
  }, [onClose]);

  const activos = useMemo(() => trabajos.filter(t => t.estado !== "finalizado"), [trabajos]);
  const terminados = trabajos.filter(t => t.estado === "finalizado");
  const visibles = filtro === "activos" ? activos : filtro === "finalizados" ? terminados : trabajos;

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-[3px] sm:p-5" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="titulo-trabajos-trabajador" className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-[#f8faff] shadow-2xl sm:h-[min(92vh,900px)] sm:rounded-[28px]">
      <header className="shrink-0 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] px-5 py-6 text-white sm:px-8">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20"><UserRound size={25}/></span>
          <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/75">La Providencia · Equipo</p><h2 id="titulo-trabajos-trabajador" className="mt-1 text-xl font-extrabold sm:text-2xl">Seguimiento de trabajador</h2><p className="mt-1 break-words text-sm text-white/85">{trabajador.nombre}</p></div>
          <button onClick={onClose} aria-label="Cerrar seguimiento" className="rounded-xl p-2 transition hover:bg-white/20"><X size={22}/></button>
        </div>
      </header>
      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[[trabajos.length,"Asignaciones",BriefcaseBusiness],[activos.length,"Activos",Clock3],[terminados.length,"Finalizados",CheckCircle2]].map(([valor,etiqueta,Icono]) => <div key={etiqueta} className="rounded-2xl border border-[#dfe6f2] bg-white p-3 shadow-sm sm:p-4"><Icono size={19} className="mb-2 text-[#124B91]"/><p className="text-2xl font-black text-slate-900">{cargando ? "—" : valor}</p><p className="text-xs font-semibold text-slate-500">{etiqueta}</p></div>)}
        </div>
        <div className="rounded-2xl border border-dashed border-[#aebed8] bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-5">
          <div className="flex items-start gap-3"><span className="rounded-xl bg-white p-2 text-[#124B91]"><Timer size={22}/></span><div><h3 className="font-extrabold text-slate-900">Avance y horas laboradas</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">Espacio preparado para registrar horas por trabajo, actividades realizadas y observaciones. El seguimiento detallado se implementará en una siguiente etapa.</p><span className="mt-3 inline-block rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-[#124B91]">Próximamente · Sin registros todavía</span></div></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-extrabold text-slate-900">Trabajos asignados</h3><p className="text-xs text-slate-500">Consulta el estado y los detalles de cada trabajo.</p></div>
          <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
            {[[ "activos", "Activos" ],[ "todos", "Todos" ],[ "finalizados", "Finalizados" ]].map(([id,nombre]) => <button key={id} onClick={() => setFiltro(id)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filtro === id ? "bg-[#124B91] text-white" : "text-slate-600 hover:bg-slate-100"}`}>{nombre}</button>)}
          </div>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        {cargando ? <p className="py-8 text-center text-sm text-slate-500">Cargando asignaciones...</p> : visibles.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No hay trabajos en esta categoría.</div> : <div className="space-y-3">
          {visibles.map(t => {
            const indice = etapas.indexOf(t.estado);
            const abierto = expandido === t._id;
            const maps = enlaceMaps(t.ubicacionMaps);
            return <article key={t._id} className="overflow-hidden rounded-2xl border border-[#dfe6f2] bg-white shadow-sm">
              <button type="button" aria-expanded={abierto} onClick={() => setExpandido(abierto ? null : t._id)} className="w-full p-4 text-left transition hover:bg-blue-50/50 sm:p-5">
                <div className="flex items-start gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-[#124B91]"><Layers3 size={20}/></span><div className="min-w-0 flex-1"><p className="break-words font-extrabold text-slate-900">{t.nombre}</p><p className="mt-1 text-xs capitalize text-slate-500">{t.material} · Entrega {fecha(t.fechaFinal)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${t.estado === "finalizado" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-[#124B91]"}`}>{nombres[t.estado] || t.estado}</span>{abierto ? <ChevronUp size={18} className="mt-1 shrink-0 text-slate-500"/> : <ChevronDown size={18} className="mt-1 shrink-0 text-slate-500"/>}</div>
                <div className="mt-4 flex gap-1.5" aria-label={`Etapa: ${nombres[t.estado] || t.estado}`}>{etapas.map((etapa,i) => <span key={etapa} className={`h-1.5 flex-1 rounded-full ${i <= indice ? "bg-[#124B91]" : "bg-slate-200"}`}/>)}</div>
                <p className="mt-2 text-right text-[11px] text-slate-500">Etapa {indice >= 0 ? indice+1 : "—"} de 5 · No representa horas laboradas</p>
              </button>
              {abierto && <div className="space-y-4 border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-slate-500">Inicio</p><p className="mt-1 font-semibold text-slate-800">{fecha(t.fechaInicio)}</p></div><div><p className="text-xs text-slate-500">Entrega</p><p className="mt-1 font-semibold text-slate-800">{fecha(t.fechaFinal)}</p></div>{t.cliente?.nombre && <div className="col-span-2"><p className="text-xs text-slate-500">Cliente</p><p className="font-semibold text-slate-800">{t.cliente.nombre}</p></div>}</div>
                {t.medidas && <p className="whitespace-pre-wrap break-words text-sm text-slate-700"><Ruler size={16} className="mr-2 inline text-[#124B91]"/><strong>Medidas:</strong> {t.medidas}</p>}
                {t.especificaciones && <p className="whitespace-pre-wrap break-words text-sm text-slate-700"><ClipboardList size={16} className="mr-2 inline text-[#124B91]"/><strong>Especificaciones:</strong> {t.especificaciones}</p>}
                {t.fotoMedidas && <a href={t.fotoMedidas} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#124B91] hover:underline">Ver fotografía de medidas <ExternalLink size={15}/></a>}
                {(t.direccionInstalacion || maps) && <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700"><MapPin size={17} className="text-[#124B91]"/><span className="min-w-0 flex-1 break-words">{t.direccionInstalacion || "Ubicación de instalación"}</span>{maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="font-bold text-[#124B91] hover:underline">Maps ↗</a>}</div>}
                <div className="rounded-xl border border-dashed border-blue-200 bg-white p-3 text-sm text-slate-500"><Clock3 size={16} className="mr-2 inline text-[#124B91]"/>Horas laboradas y bitácora: pendientes de implementar.</div>
              </div>}
            </article>;
          })}
        </div>}
      </div>
    </section>
  </div>;
}
