import { useEffect, useState } from "react";
import { X } from "lucide-react";

const inicial = { nombre: "", material: "granito", especificaciones: "", fechaInicio: "", fechaFinal: "", estado: "templado", cliente: "", trabajador: "", responsableTemple: "" };
const fechaInput = (fecha) => fecha ? new Date(fecha).toISOString().slice(0, 10) : "";

export default function ModalTrabajo({ trabajo, clientes, trabajadores, onClose, onSave, saving }) {
  const [datos, setDatos] = useState(inicial);
  useEffect(() => {
    setDatos(trabajo ? {
      nombre: trabajo.nombre || "", material: trabajo.material || "granito",
      especificaciones: trabajo.especificaciones || "", fechaInicio: fechaInput(trabajo.fechaInicio),
      fechaFinal: fechaInput(trabajo.fechaFinal), estado: trabajo.estado || "templado",
      cliente: trabajo.cliente?._id || trabajo.cliente || "",
      trabajador: trabajo.trabajador?._id || trabajo.trabajador || "",
      responsableTemple: trabajo.responsableTemple?._id || trabajo.responsableTemple || ""
    } : inicial);
  }, [trabajo]);
  const cambiar = (e) => setDatos(actual => ({ ...actual, [e.target.name]: e.target.value }));
  const campo = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-[#124B91] focus:ring-2 focus:ring-blue-100";
  const etiqueta = "mb-1.5 block text-sm font-semibold text-slate-700";
  const personalDisponible = (id) => trabajadores.filter(t => t.activo || t._id === id);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-trabajo" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#124B91]">Gestión de proyectos</p><h2 id="titulo-modal-trabajo" className="text-xl font-bold">{trabajo ? "Editar trabajo" : "Nuevo trabajo"}</h2></div>
        <button type="button" onClick={onClose} aria-label="Cerrar"><X size={22}/></button>
      </header>
      <form onSubmit={e => { e.preventDefault(); onSave({ ...datos, cliente: datos.cliente || null, trabajador: datos.trabajador || null, responsableTemple: datos.responsableTemple || null }); }} className="grid gap-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className={etiqueta} htmlFor="nombre-trabajo">Nombre del trabajo *</label><input id="nombre-trabajo" name="nombre" required maxLength={150} className={campo} value={datos.nombre} onChange={cambiar} placeholder="Ej. Cubierta de cocina"/></div>
        <div><label className={etiqueta} htmlFor="cliente-trabajo">Cliente</label><select id="cliente-trabajo" name="cliente" className={campo} value={datos.cliente} onChange={cambiar}><option value="">Sin cliente asignado</option>{clientes.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}</select></div>
        <div><label className={etiqueta} htmlFor="material-trabajo">Material *</label><select id="material-trabajo" name="material" className={campo} value={datos.material} onChange={cambiar}><option value="granito">Granito</option><option value="vidrio">Vidrio</option></select></div>
        <div><label className={etiqueta} htmlFor="inicio-trabajo">Fecha de inicio *</label><input id="inicio-trabajo" name="fechaInicio" type="date" required className={campo} value={datos.fechaInicio} onChange={cambiar}/></div>
        <div><label className={etiqueta} htmlFor="fin-trabajo">Fecha de entrega *</label><input id="fin-trabajo" name="fechaFinal" type="date" min={datos.fechaInicio || undefined} required className={campo} value={datos.fechaFinal} onChange={cambiar}/></div>
        <div><label className={etiqueta} htmlFor="trabajador-trabajo">Trabajador asignado</label><select id="trabajador-trabajo" name="trabajador" className={campo} value={datos.trabajador} onChange={cambiar}><option value="">Sin asignar</option>{personalDisponible(datos.trabajador).map(t => <option key={t._id} value={t._id}>{t.nombre}{!t.activo ? " (inactivo)" : ""}</option>)}</select></div>
        <div><label className={etiqueta} htmlFor="temple-trabajo">Responsable de templado</label><select id="temple-trabajo" name="responsableTemple" className={campo} value={datos.responsableTemple} onChange={cambiar}><option value="">Sin asignar</option>{personalDisponible(datos.responsableTemple).map(t => <option key={t._id} value={t._id}>{t.nombre}{!t.activo ? " (inactivo)" : ""}</option>)}</select></div>
        <div className="sm:col-span-2"><label className={etiqueta} htmlFor="estado-trabajo">Estado del trabajo</label><select id="estado-trabajo" name="estado" className={campo} value={datos.estado} onChange={cambiar}><option value="templado">Templado</option><option value="fabricacion">Fabricación</option><option value="detallado">Detallado</option><option value="instalacion">Instalación</option><option value="finalizado">Finalizado</option></select></div>
        <div className="sm:col-span-2"><label className={etiqueta} htmlFor="especificaciones-trabajo">Especificaciones</label><textarea id="especificaciones-trabajo" name="especificaciones" rows={3} className={campo} value={datos.especificaciones} onChange={cambiar} placeholder="Medidas, acabados, detalles de instalación..."/></div>
        <div className="flex justify-end gap-3 border-t pt-5 sm:col-span-2"><button type="button" onClick={onClose} className="rounded-xl border px-5 py-2.5 font-semibold">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-[#124B91] px-5 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : trabajo ? "Guardar cambios" : "Crear trabajo"}</button></div>
      </form>
    </div>
  </div>;
}
