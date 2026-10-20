import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarDays, Pencil, Plus, Search, Trash2, UserRound, Navigation, ExternalLink, Ruler, Package, Banknote, MessageCircle, MapPin, Image as ImageIcon } from "lucide-react";
import { obtenerClientes } from "../../clientes/services/clientesService";
import { obtenerTrabajadores } from "../../trabajadores/services/trabajadoresService";
import { actualizarTrabajo, crearTrabajo, eliminarTrabajo, obtenerTrabajos } from "../services/trabajosService";
import ModalTrabajo from "../components/ModalTrabajo";
import { enlaceWhatsApp, enlaceMaps } from "../../clientes/utils/enlacesCliente";
import ModalCliente from "../../clientes/components/ModalCliente";
import DetalleCliente from "../../clientes/components/DetalleCliente";
import ModalTrabajador from "../../trabajadores/components/ModalTrabajador";
import { crearCliente } from "../../clientes/services/clientesService";
import { crearTrabajador } from "../../trabajadores/services/trabajadoresService";

const etapas = { templado: "Templado", fabricacion: "Fabricación", detallado: "Detallado", instalacion: "Instalación", finalizado: "Finalizado" };
const colores = { templado: "bg-amber-100 text-amber-800", fabricacion: "bg-violet-100 text-violet-800", detallado: "bg-sky-100 text-sky-800", instalacion: "bg-indigo-100 text-indigo-800", finalizado: "bg-emerald-100 text-emerald-800" };
const mostrarFecha = fecha => fecha ? new Date(fecha).toLocaleDateString("es-MX", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }) : "Sin fecha";

export default function SeccionTrabajos() {
  const [trabajos, setTrabajos] = useState([]);
  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [clienteNuevoTrabajo, setClienteNuevoTrabajo] = useState(null);
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
  const abrirNuevo = () => { setClienteNuevoTrabajo(null); setEditando(null); setModalAbierto(true); };
  const abrirEdicion = trabajo => { setClienteNuevoTrabajo(null); setEditando(trabajo); setModalAbierto(true); };
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
        {filtrados.map(t => {
          const indice = Object.keys(etapas).indexOf(t.estado);
          const whatsapp = enlaceWhatsApp(t.cliente?.whatsapp);
          const mensaje = encodeURIComponent(`Hola, ${t.cliente?.nombre || ""}. Te contactamos de La Providencia para dar seguimiento a tu trabajo: ${t.nombre}.`);
          const maps = enlaceMaps(t.ubicacionMaps);
          return <article key={t._id} className="brand-card overflow-hidden">
            <div className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="rounded-xl bg-blue-50 p-3 text-[#124B91]"><BriefcaseBusiness size={22}/></span>
                  <div className="min-w-0"><h3 className="break-words text-lg font-extrabold text-slate-900">{t.nombre}</h3><p className="mt-1 text-sm capitalize text-slate-500">{t.material} · Entrega {mostrarFecha(t.fechaFinal)}</p></div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${colores[t.estado] || "bg-slate-100 text-slate-700"}`}>{etapas[t.estado] || t.estado}</span>
              </div>
              <div><div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500"><span>Progreso de producción</span><span>{indice >= 0 ? indice + 1 : 0} de 5 etapas</span></div><div className="flex gap-1.5" aria-label={`Estado: ${etapas[t.estado] || t.estado}`}>{Object.keys(etapas).map((etapa, i) => <span key={etapa} className={`h-2 flex-1 rounded-full ${i <= indice ? "bg-[#124B91]" : "bg-slate-200"}`}/>)}</div></div>
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#124B91]"><UserRound size={21}/></span>
                <div className="min-w-0 flex-1"><p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Cliente</p>{t.cliente?._id ? <button type="button" onClick={() => setClienteDetalle(t.cliente)} className="break-words text-left font-extrabold text-slate-900 underline-offset-4 hover:text-[#124B91] hover:underline">{t.cliente.nombre} ↗</button> : <p className="font-extrabold text-slate-900">Sin asignar</p>}</div>
                {whatsapp ? <a href={whatsapp + "?text=" + mensaje} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><MessageCircle size={17}/> Mensaje</a> : <span className="rounded-lg bg-white px-3 py-2 text-xs text-slate-500">Sin WhatsApp</span>}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div><p className="text-xs text-slate-500">Trabajador asignado</p><p className="mt-1 font-semibold text-slate-800">{t.trabajador?.nombre || "Sin asignar"}</p></div>
                <div><p className="text-xs text-slate-500">Responsable de templado</p><p className="mt-1 font-semibold text-slate-800">{t.responsableTemple?.nombre || "Sin asignar"}</p></div>
                <div><p className="text-xs text-slate-500">Fecha de inicio</p><p className="mt-1 font-semibold text-slate-800">{mostrarFecha(t.fechaInicio)}</p></div>
                <div><p className="text-xs text-slate-500">Piezas</p><p className="mt-1 font-semibold text-slate-800">{t.piezasTotales ?? "Sin registrar"}</p></div>
                {t.precioTotal != null && <div><p className="text-xs text-slate-500">Precio total</p><p className="mt-1 font-semibold text-slate-800">{Number(t.precioTotal).toLocaleString("es-MX", {style:"currency",currency:"MXN"})}</p></div>}
                {t.medidas && <div className="col-span-2"><p className="text-xs text-slate-500">Medidas</p><p className="mt-1 whitespace-pre-wrap break-words font-medium text-slate-800">{t.medidas}</p></div>}
              </div>
              {t.fotoMedidas && <a href={t.fotoMedidas} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm font-bold text-[#124B91] hover:bg-blue-50"><img src={t.fotoMedidas} alt="Croquis o medidas" className="h-16 w-20 rounded-lg object-cover"/><ImageIcon size={17}/> Ver fotografía de medidas <ExternalLink size={14}/></a>}
              {(t.direccionInstalacion || maps) && <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3"><MapPin size={18} className="shrink-0 text-[#124B91]"/><div className="min-w-0 flex-1"><p className="text-xs text-slate-500">Ubicación de instalación</p><p className="break-words text-sm font-semibold text-slate-800">{t.direccionInstalacion || "Ver ubicación en el mapa"}</p></div>{maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-[#124B91] hover:bg-blue-50">Maps <ExternalLink size={14}/></a>}</div>}
              {t.especificaciones && <p className="line-clamp-2 text-sm text-slate-500">{t.especificaciones}</p>}
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button onClick={() => abrirEdicion(t)} className="inline-flex items-center gap-2 rounded-xl bg-[#124B91] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d3770]"><Pencil size={16}/> Editar / Asignar</button><button onClick={() => borrar(t)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 size={16}/> Eliminar</button></div>
            </div>
          </article>;
        })}
      </div>}
    {clienteDetalle && <DetalleCliente cliente={clientes.find(c => c._id === clienteDetalle._id) || clienteDetalle} trabajos={trabajos} onClose={() => setClienteDetalle(null)} onNuevoTrabajo={cliente => {setClienteDetalle(null);setClienteNuevoTrabajo(cliente);setEditando(null);setModalAbierto(true);}} onAbrirTrabajo={trabajo => {setClienteDetalle(null);abrirEdicion(trabajo);}}/>}
    {modalAbierto && <ModalTrabajo trabajo={editando} clienteInicial={clienteNuevoTrabajo} clientes={clientes} trabajadores={trabajadores} onClose={() => setModalAbierto(false)} onSave={guardar} saving={guardando} onNuevoCliente={() => setAltaRapida("cliente")} onNuevoTrabajador={() => setAltaRapida("trabajador")}/>}
    {altaRapida === "cliente" && <ModalCliente cliente={null} guardar={guardarAltaRapida} cerrar={() => setAltaRapida(null)} guardando={guardandoAlta}/>}
    {altaRapida === "trabajador" && <ModalTrabajador trabajador={null} onSave={guardarAltaRapida} onClose={() => setAltaRapida(null)} saving={guardandoAlta}/>} 
  </section>;
}
