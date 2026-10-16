import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarDays, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import { obtenerClientes } from "../../clientes/services/clientesService";
import { obtenerTrabajadores } from "../../trabajadores/services/trabajadoresService";
import { actualizarTrabajo, crearTrabajo, eliminarTrabajo, obtenerTrabajos } from "../services/trabajosService";
import ModalTrabajo from "../components/ModalTrabajo";

const etapas = { templado: "Templado", fabricacion: "Fabricación", detallado: "Detallado", instalacion: "Instalación", finalizado: "Finalizado" };
const colores = { templado: "bg-amber-100 text-amber-800", fabricacion: "bg-violet-100 text-violet-800", detallado: "bg-sky-100 text-sky-800", instalacion: "bg-indigo-100 text-indigo-800", finalizado: "bg-emerald-100 text-emerald-800" };
const mostrarFecha = fecha => fecha ? new Date(fecha).toLocaleDateString("es-MX", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }) : "Sin fecha";

export default function SeccionTrabajos() {
  const [trabajos, setTrabajos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [editando, setEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [t, c, p] = await Promise.all([obtenerTrabajos(), obtenerClientes(), obtenerTrabajadores()]);
      setTrabajos(t.trabajos || []);
      setClientes(c.clientes || []);
      setTrabajadores(p.trabajadores || []);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);
  const filtrados = useMemo(() => trabajos.filter(t => {
    const texto = [t.nombre, t.cliente?.nombre, t.trabajador?.nombre, t.responsableTemple?.nombre].filter(Boolean).join(" ").toLowerCase();
    return (filtro === "todos" || t.estado === filtro) && texto.includes(busqueda.toLowerCase());
  }), [trabajos, busqueda, filtro]);
  const guardar = async datos => {
    setGuardando(true); setError(""); setAviso("");
    try {
      if (editando) await actualizarTrabajo(editando._id, datos);
      else await crearTrabajo(datos);
      setModalAbierto(false); setEditando(null);
      await cargar(); setAviso(editando ? "Trabajo actualizado correctamente." : "Trabajo creado y listo para asignación.");
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };
  const borrar = async trabajo => {
    if (!window.confirm(`¿Eliminar el trabajo "${trabajo.nombre}"? Esta acción no se puede deshacer.`)) return;
    setError(""); setAviso("");
    try { await eliminarTrabajo(trabajo._id); await cargar(); setAviso("Trabajo eliminado."); }
    catch (e) { setError(e.message); }
  };
  const abrirNuevo = () => { setEditando(null); setModalAbierto(true); };
  const abrirEdicion = trabajo => { setEditando(trabajo); setModalAbierto(true); };
  return <section className="mx-auto max-w-6xl p-5 md:p-10">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm font-semibold text-[#124B91]">CONTROL DE PRODUCCIÓN</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Trabajos</h1><p className="mt-2 text-slate-500">Organiza pedidos, asigna personal y controla las etapas de producción.</p></div>
      <button onClick={abrirNuevo} className="flex items-center gap-2 rounded-xl bg-[#124B91] px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-800"><Plus size={18}/> Nuevo trabajo</button>
    </div>
    <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><Search size={20} className="text-slate-400"/><input aria-label="Buscar trabajos" placeholder="Buscar por trabajo, cliente o trabajador..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full outline-none"/></label>
      <select aria-label="Filtrar por estado" value={filtro} onChange={e => setFiltro(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3"><option value="todos">Todos los estados</option>{Object.entries(etapas).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}</select>
    </div>
    {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    {aviso && <div role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-green-800">{aviso}</div>}
    {cargando ? <p className="py-12 text-center text-slate-500">Cargando trabajos...</p> : filtrados.length === 0 ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500"><BriefcaseBusiness size={36} className="mx-auto mb-3 text-slate-300"/><p>No hay trabajos para mostrar.</p><button onClick={abrirNuevo} className="mt-4 font-semibold text-[#124B91]">Registrar el primer trabajo</button></div> :
      <div className="grid gap-4 lg:grid-cols-2">
        {filtrados.map(t => <article key={t._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-[#124B91]"><BriefcaseBusiness size={22}/></div><div><h3 className="text-lg font-bold text-slate-900">{t.nombre}</h3><p className="text-sm capitalize text-slate-500">{t.material}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${colores[t.estado] || "bg-slate-100"}`}>{etapas[t.estado] || t.estado}</span></div>
          <div className="space-y-2 text-sm text-slate-600"><p><UserRound size={15} className="mr-2 inline text-slate-400"/><strong>Cliente:</strong> {t.cliente?.nombre || "Sin asignar"}</p><p><strong>Trabajador:</strong> {t.trabajador?.nombre || "Sin asignar"}</p><p><strong>Responsable de templado:</strong> {t.responsableTemple?.nombre || "Sin asignar"}</p><p><CalendarDays size={15} className="mr-2 inline text-slate-400"/>{mostrarFecha(t.fechaInicio)} — {mostrarFecha(t.fechaFinal)}</p></div>
          {t.especificaciones && <p className="mt-3 line-clamp-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{t.especificaciones}</p>}
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4"><button onClick={() => abrirEdicion(t)} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"><Pencil size={15}/> Editar / Asignar</button><button onClick={() => borrar(t)} className="flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"><Trash2 size={15}/> Eliminar</button></div>
        </article>)}
      </div>}
    {modalAbierto && <ModalTrabajo trabajo={editando} clientes={clientes} trabajadores={trabajadores} onClose={() => setModalAbierto(false)} onSave={guardar} saving={guardando}/>}
  </section>;
}
