import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarDays, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import { obtenerClientes } from "../../clientes/services/clientesService";
import { obtenerTrabajadores } from "../../trabajadores/services/trabajadoresService";
import { actualizarTrabajo, crearTrabajo, eliminarTrabajo, obtenerTrabajos } from "../services/trabajosService";
import ModalTrabajo from "../components/ModalTrabajo";
import ModalCliente from "../../clientes/components/ModalCliente";
import ModalTrabajador from "../../trabajadores/components/ModalTrabajador";
import { crearCliente } from "../../clientes/services/clientesService";
import { crearTrabajador } from "../../trabajadores/services/trabajadoresService";

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
  const [altaRapida, setAltaRapida] = useState(null);
  const [guardandoAlta, setGuardandoAlta] = useState(false);

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
  const guardarAltaRapida = async datos => {
    setGuardandoAlta(true); setError("");
    try {
      if (altaRapida === "cliente") {
        const nuevo = await crearCliente(datos);
        const lista = await obtenerClientes();
        setClientes(lista.clientes || []);
        setAviso("Cliente registrado. Ya puedes seleccionarlo en el trabajo.");
      } else {
        await crearTrabajador({ nombre: datos.nombre, whatsapp: datos.whatsapp });
        const lista = await obtenerTrabajadores();
        setTrabajadores(lista.trabajadores || []);
        setAviso("Trabajador registrado. Ya puedes asignarlo.");
      }
      setAltaRapida(null);
    } catch (e) { setError(e.message); }
    finally { setGuardandoAlta(false); }
  };
  const abrirNuevo = () => { setEditando(null); setModalAbierto(true); };
  const abrirEdicion = trabajo => { setEditando(trabajo); setModalAbierto(true); };
  return <section className="mx-auto max-w-7xl p-4 pb-12 sm:p-6 lg:p-10">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white shadow-[0_18px_40px_rgba(43,46,101,.2)] sm:p-9"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/75">LA PROVIDENCIA · ADMINISTRACIÓN</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Gestión de trabajos</h1><p className="mt-3 max-w-xl text-base text-white/85">Controla pedidos, responsables y etapas de producción.</p></div><button onClick={abrirNuevo} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-[#123e83] shadow-sm hover:bg-blue-50"><Plus size={19}/> Nuevo trabajo</button></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
      <label className="flex items-center gap-3 rounded-2xl border-2 border-[#cbd4e6] bg-white px-5 py-4 shadow-sm"><Search size={20} className="text-slate-400"/><input aria-label="Buscar trabajos" placeholder="Buscar por trabajo, cliente o trabajador..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full outline-none"/></label>
      <select aria-label="Filtrar por estado" value={filtro} onChange={e => setFiltro(e.target.value)} className="rounded-2xl border-2 border-[#cbd4e6] bg-white px-5 py-4 shadow-sm"><option value="todos">Todos los estados</option>{Object.entries(etapas).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}</select>
    </div>
    {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    {aviso && <div role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-green-800">{aviso}</div>}
    {cargando ? <p className="py-12 text-center text-slate-500">Cargando trabajos...</p> : filtrados.length === 0 ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500"><BriefcaseBusiness size={36} className="mx-auto mb-3 text-slate-300"/><p>No hay trabajos para mostrar.</p><button onClick={abrirNuevo} className="mt-4 font-semibold text-[#124B91]">Registrar el primer trabajo</button></div> :
      <div className="grid gap-4 lg:grid-cols-2">
        {filtrados.map(t => <article key={t._id} className="brand-card group">
          <div className="p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-[#124B91]"><BriefcaseBusiness size={22}/></div><div><h3 className="text-lg font-bold text-slate-900">{t.nombre}</h3><p className="text-sm capitalize text-slate-500">{t.material}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${colores[t.estado] || "bg-slate-100"}`}>{etapas[t.estado] || t.estado}</span></div>
          <div className="space-y-3 rounded-xl border border-[#e2e7f1] bg-gradient-to-br from-[#f2f6fc] to-[#faf3f8] p-4 text-sm font-medium text-slate-700"><p><UserRound size={15} className="mr-2 inline text-slate-400"/><strong>Cliente:</strong> {t.cliente?.nombre || "Sin asignar"}</p><p><strong>Trabajador:</strong> {t.trabajador?.nombre || "Sin asignar"}</p><p><strong>Responsable de templado:</strong> {t.responsableTemple?.nombre || "Sin asignar"}</p><p><CalendarDays size={15} className="mr-2 inline text-slate-400"/>{mostrarFecha(t.fechaInicio)} — {mostrarFecha(t.fechaFinal)}</p></div>
          {t.especificaciones && <p className="mt-4 line-clamp-2 rounded-xl border border-[#e2e7f1] bg-white p-3 text-sm text-slate-600">{t.especificaciones}</p>}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button onClick={() => abrirEdicion(t)} className="flex items-center gap-2 rounded-xl border-2 border-[#b9c9e3] bg-blue-50 px-3 py-2 text-sm font-bold text-[#124B91] hover:bg-blue-100"><Pencil size={15}/> Editar / Asignar</button><button onClick={() => borrar(t)} className="flex items-center gap-2 rounded-xl border-2 border-red-100 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 size={15}/> Eliminar</button></div>
          </div></article>)}
      </div>}
    {modalAbierto && <ModalTrabajo trabajo={editando} clientes={clientes} trabajadores={trabajadores} onClose={() => setModalAbierto(false)} onSave={guardar} saving={guardando} onNuevoCliente={() => setAltaRapida("cliente")} onNuevoTrabajador={() => setAltaRapida("trabajador")}/>}
    {altaRapida === "cliente" && <ModalCliente cliente={null} guardar={guardarAltaRapida} cerrar={() => setAltaRapida(null)} guardando={guardandoAlta}/>}
    {altaRapida === "trabajador" && <ModalTrabajador trabajador={null} onSave={guardarAltaRapida} onClose={() => setAltaRapida(null)} saving={guardandoAlta}/>} 
  </section>;
}
