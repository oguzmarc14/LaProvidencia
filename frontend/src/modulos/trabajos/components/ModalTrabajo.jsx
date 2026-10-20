import { useEffect, useState } from "react";
import { enlaceMaps } from "../../clientes/utils/enlacesCliente";
import { X, Plus, BriefcaseBusiness, CalendarDays, UsersRound, ClipboardList, ArrowRight, Check, Layers3, MapPin, Navigation, ExternalLink, Ruler, Package, Banknote, ImagePlus, Trash2 } from "lucide-react";

const inicial = { nombre: "", material: "granito", especificaciones: "", medidas: "", fotoMedidas: "", piezasTotales: "", precioTotal: "", direccionInstalacion: "", ubicacionMaps: "", fechaInicio: "", fechaFinal: "", estado: "templado", cliente: "", trabajador: "", responsableTemple: "" };
const fechaInput = fecha => fecha ? new Date(fecha).toISOString().slice(0, 10) : "";
const etapas = [["templado","Templado"],["fabricacion","Fabricación"],["detallado","Detallado"],["instalacion","Instalación"],["finalizado","Finalizado"]];
const secciones = [{ id: "datos", nombre: "Información", icono: ClipboardList }, { id: "equipo", nombre: "Responsables", icono: UsersRound }, { id: "fechas", nombre: "Programación", icono: CalendarDays }];
const claseCampo = "w-full min-h-12 rounded-xl border-2 border-[#c8d3e7] bg-[#f7f9fd] px-4 py-3 text-base font-medium text-slate-800 outline-none transition focus:border-[#124B91] focus:ring-4 focus:ring-blue-100";
const claseEtiqueta = "mb-2 block text-sm font-bold text-slate-800";

export default function ModalTrabajo({ trabajo, clientes, trabajadores, onClose, onSave, saving, onNuevoCliente, onNuevoTrabajador }) {
  const [datos, setDatos] = useState(inicial);
  const [seccion, setSeccion] = useState("datos");
  useEffect(() => {
    setDatos(trabajo ? {
      nombre: trabajo.nombre || "", material: trabajo.material || "granito", especificaciones: trabajo.especificaciones || "", medidas: trabajo.medidas || "", fotoMedidas: trabajo.fotoMedidas || "", piezasTotales: trabajo.piezasTotales ?? "", precioTotal: trabajo.precioTotal ?? "", direccionInstalacion: trabajo.direccionInstalacion || "", ubicacionMaps: trabajo.ubicacionMaps || "",
      fechaInicio: fechaInput(trabajo.fechaInicio), fechaFinal: fechaInput(trabajo.fechaFinal), estado: trabajo.estado || "templado",
      cliente: trabajo.cliente?._id || trabajo.cliente || "", trabajador: trabajo.trabajador?._id || trabajo.trabajador || "",
      responsableTemple: trabajo.responsableTemple?._id || trabajo.responsableTemple || ""
    } : inicial);
  }, [trabajo]);
  const [errorFoto, setErrorFoto] = useState("");
  const subirFoto = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) { setErrorFoto("Solo se permiten JPG, PNG o WebP."); return; }
    if (archivo.size > 10 * 1024 * 1024) { setErrorFoto("La imagen debe pesar menos de 10 MB."); return; }
    const url = URL.createObjectURL(archivo);
    try {
      const imagen = new Image();
      await new Promise((resolve, reject) => { imagen.onload = resolve; imagen.onerror = reject; imagen.src = url; });
      const escala = Math.min(1, 1400 / Math.max(imagen.width, imagen.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(imagen.width * escala));
      canvas.height = Math.max(1, Math.round(imagen.height * escala));
      canvas.getContext("2d").drawImage(imagen, 0, 0, canvas.width, canvas.height);
      const foto = canvas.toDataURL("image/jpeg", 0.78);
      if (foto.length > 1400000) throw new Error("La foto sigue siendo muy grande. Prueba una imagen más pequeña.");
      setDatos(actual => ({ ...actual, fotoMedidas: foto }));
      setErrorFoto("");
    } catch (error) { setErrorFoto(error.message || "No se pudo procesar la fotografía."); }
    finally { URL.revokeObjectURL(url); }
  };
  const maps = enlaceMaps(datos.ubicacionMaps);
  const enlaceInvalido = !!datos.ubicacionMaps.trim() && !maps;
  const cambiar = e => setDatos(actual => ({ ...actual, [e.target.name]: e.target.value }));
  const personalDisponible = id => trabajadores.filter(t => t.activo || t._id === id);
  const ir = id => { setSeccion(id); document.getElementById("trabajo-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const enviar = e => {
    e.preventDefault();
    if (enlaceInvalido) return;
    onSave({ ...datos, piezasTotales: datos.piezasTotales === "" ? null : Number(datos.piezasTotales), precioTotal: datos.precioTotal === "" ? null : Number(datos.precioTotal), cliente: datos.cliente || null, trabajador: datos.trabajador || null, responsableTemple: datos.responsableTemple || null });
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1631]/80 p-0 backdrop-blur-[6px] md:p-5" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-trabajo" className="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-[#e9edf7] shadow-2xl md:h-[min(94vh,940px)] md:rounded-[28px] md:border md:border-white/70">
      <header className="flex shrink-0 items-center justify-between gap-4 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#9d4165] px-5 py-5 text-white sm:px-8">
        <div className="flex items-center gap-4">
          <div className="hidden rounded-2xl bg-white/15 p-3 sm:block"><BriefcaseBusiness size={28}/></div>
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-white/75">La Providencia · Producción</p><h2 id="titulo-modal-trabajo" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{trabajo ? "Editar trabajo" : "Registrar nuevo trabajo"}</h2><p className="mt-1 hidden text-sm text-white/80 sm:block">Organiza la información, asigna personal y programa la entrega.</p></div>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="rounded-xl bg-white/15 p-3 transition hover:bg-white/25"><X size={23}/></button>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-7 lg:flex">
          <p className="mb-5 px-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">Secciones</p>
          {secciones.map((s, i) => <button type="button" key={s.id} onClick={() => ir(s.id)} className={`mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-left font-bold transition ${seccion === s.id ? "bg-blue-50 text-[#124B91]" : "text-slate-500 hover:bg-slate-50"}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${seccion === s.id ? "bg-[#124B91] text-white" : "bg-slate-100"}`}>{i+1}</span>{s.nombre}</button>)}
          <div className="mt-auto rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-4"><Layers3 size={24} className="mb-3 text-[#124B91]"/><p className="font-bold text-slate-800">Todo en un lugar</p><p className="mt-1 text-sm leading-relaxed text-slate-500">Puedes crear un cliente o trabajador sin salir de este registro.</p></div>
        </aside>
        <form id="form-trabajo" onSubmit={enviar} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(163,61,99,.12),transparent_46%),radial-gradient(ellipse_at_bottom_left,rgba(18,75,145,.13),transparent_48%),linear-gradient(145deg,#edf1fa,#f5edf4)] px-4 py-5 sm:px-8 sm:py-7">
            <div className="grid grid-cols-3 gap-2 lg:hidden">{secciones.map((s,i) => <button key={s.id} type="button" onClick={() => ir(s.id)} className={`rounded-xl px-2 py-3 text-xs font-bold sm:text-sm ${seccion===s.id ? "bg-[#124B91] text-white" : "bg-white text-slate-600"}`}>{i+1}. {s.nombre}</button>)}</div>
            <section id="trabajo-datos" className="scroll-mt-4 rounded-2xl border border-[#cbd4e6] bg-white p-5 shadow-[0_8px_30px_rgba(25,45,90,.10)] sm:p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-[#124B91]"><ClipboardList size={23}/></span><div><h3 className="text-xl font-extrabold text-slate-900">Información del trabajo</h3><p className="text-sm text-slate-500">¿Qué vamos a fabricar o instalar?</p></div></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className={claseEtiqueta} htmlFor="nombre-trabajo">Nombre del trabajo <span className="text-rose-600">*</span></label><input id="nombre-trabajo" name="nombre" autoFocus required maxLength={150} className={claseCampo} value={datos.nombre} onChange={cambiar} placeholder="Ej. Cubierta de granito para cocina"/></div>
                <div><label className={claseEtiqueta} htmlFor="cliente-trabajo">Cliente</label><select id="cliente-trabajo" name="cliente" className={claseCampo} value={datos.cliente} onChange={cambiar}><option value="">Seleccionar cliente</option>{clientes.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}</select><button type="button" onClick={onNuevoCliente} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#124B91] hover:underline"><Plus size={16}/> Registrar cliente nuevo</button></div>
                <div><label className={claseEtiqueta} htmlFor="material-trabajo">Material <span className="text-rose-600">*</span></label><select id="material-trabajo" name="material" className={claseCampo} value={datos.material} onChange={cambiar}><option value="granito">Granito</option><option value="vidrio">Vidrio</option></select></div>
                <div className="sm:col-span-2 rounded-2xl border border-[#cbd4e6] bg-gradient-to-br from-[#f0f5fc] to-[#f7eef7] p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[#124B91]"><Ruler size={22}/><h4 className="text-lg font-extrabold">Detalles de fabricación</h4></div>
                  <p className="mb-5 text-sm text-slate-600">Registra las medidas, la cantidad de piezas y el precio acordado.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><label className={claseEtiqueta} htmlFor="medidas-trabajo"><Ruler size={16} className="mr-1 inline"/> Medidas <span className="font-medium text-slate-400">(opcional)</span></label><textarea id="medidas-trabajo" name="medidas" rows={2} className={claseCampo} value={datos.medidas} onChange={cambiar} placeholder="Ej. Cubierta 2.40 × 0.60 m; barra 1.20 × 0.50 m"/></div>
                    <div className="sm:col-span-2">
                      <label className={claseEtiqueta} htmlFor="foto-medidas"><ImagePlus size={16} className="mr-1 inline"/> Foto del croquis o medidas (opcional)</label>
                      <p className="mb-3 text-sm text-slate-500">El administrador puede adjuntar una foto de referencia. Se optimiza antes de guardarla.</p>
                      {datos.fotoMedidas && <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3"><img src={datos.fotoMedidas} alt="Foto de medidas" className="max-h-60 w-full object-contain"/><button type="button" onClick={() => setDatos(actual => ({ ...actual, fotoMedidas: "" }))} className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-red-700"><Trash2 size={16}/> Quitar foto</button></div>}
                      <input id="foto-medidas" type="file" accept="image/jpeg,image/png,image/webp" onChange={subirFoto} className="block w-full rounded-xl border border-dashed border-blue-300 bg-white p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:font-bold file:text-[#124B91]"/>
                      {errorFoto && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{errorFoto}</p>}
                    </div>
                    <div><label className={claseEtiqueta} htmlFor="piezas-trabajo"><Package size={16} className="mr-1 inline"/> Piezas totales <span className="font-medium text-slate-400">(opcional)</span></label><input id="piezas-trabajo" name="piezasTotales" type="number" min="1" step="1" className={claseCampo} value={datos.piezasTotales} onChange={cambiar} placeholder="Ej. 3"/></div>
                    <div><label className={claseEtiqueta} htmlFor="precio-trabajo"><Banknote size={16} className="mr-1 inline"/> Precio total (MXN) <span className="font-medium text-slate-400">(opcional)</span></label><input id="precio-trabajo" name="precioTotal" type="number" min="0" step="0.01" className={claseCampo} value={datos.precioTotal} onChange={cambiar} placeholder="Ej. 8500.00"/></div>
                  </div>
                </div>
                <div className="sm:col-span-2 rounded-2xl border border-[#cbd4e6] bg-gradient-to-br from-blue-50 to-purple-50 p-5">
                  <div className="mb-4 flex items-center gap-2 text-[#124B91]"><MapPin size={22}/><h4 className="font-extrabold">Ubicación de instalación</h4></div>
                  <div className="space-y-4">
                    <div><label className={claseEtiqueta} htmlFor="direccion-instalacion">Dirección de instalación <span className="font-medium text-slate-400">(opcional)</span></label><input id="direccion-instalacion" name="direccionInstalacion" className={claseCampo} value={datos.direccionInstalacion} onChange={cambiar} placeholder="Ej. Calle Hidalgo 120, Col. Centro"/></div>
                    <div><label className={claseEtiqueta} htmlFor="maps-trabajo"><Navigation size={16} className="mr-1 inline"/> Enlace de Google Maps <span className="font-medium text-slate-400">(opcional)</span></label><input id="maps-trabajo" name="ubicacionMaps" type="url" className={claseCampo} value={datos.ubicacionMaps} onChange={cambiar} aria-invalid={enlaceInvalido} aria-describedby="ayuda-maps-trabajo" placeholder="https://maps.app.goo.gl/..."/><p id="ayuda-maps-trabajo" className={`mt-2 text-xs ${enlaceInvalido ? "font-bold text-red-600" : "text-slate-600"}`}>{enlaceInvalido ? "Pega un enlace HTTPS válido de Google Maps." : "Abre Google Maps, pulsa Compartir y copia el enlace de la ubicación."}</p>{maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#124B91] hover:underline"><ExternalLink size={15}/> Comprobar ubicación</a>}</div>
                  </div>
                </div>
                <div className="sm:col-span-2"><label className={claseEtiqueta} htmlFor="especificaciones-trabajo">Especificaciones</label><textarea id="especificaciones-trabajo" name="especificaciones" rows={3} className={claseCampo} value={datos.especificaciones} onChange={cambiar} placeholder="Color, acabado, cortes y otros detalles del trabajo..."/></div>
              </div>
            </section>
            <section id="trabajo-equipo" className="scroll-mt-4 rounded-2xl border border-[#cbd4e6] bg-white p-5 shadow-[0_8px_30px_rgba(25,45,90,.10)] sm:p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-purple-100 text-[#6b3d88]"><UsersRound size={23}/></span><div><h3 className="text-xl font-extrabold text-slate-900">Asignación de personal</h3><p className="text-sm text-slate-500">¿Quién se encargará del trabajo?</p></div></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label className={claseEtiqueta} htmlFor="trabajador-trabajo">Trabajador asignado</label><select id="trabajador-trabajo" name="trabajador" className={claseCampo} value={datos.trabajador} onChange={cambiar}><option value="">Sin asignar</option>{personalDisponible(datos.trabajador).map(t => <option key={t._id} value={t._id}>{t.nombre}{!t.activo ? " (inactivo)" : ""}</option>)}</select><button type="button" onClick={onNuevoTrabajador} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#124B91] hover:underline"><Plus size={16}/> Registrar trabajador nuevo</button></div>
                <div><label className={claseEtiqueta} htmlFor="temple-trabajo">Responsable de templado</label><select id="temple-trabajo" name="responsableTemple" className={claseCampo} value={datos.responsableTemple} onChange={cambiar}><option value="">Sin asignar</option>{personalDisponible(datos.responsableTemple).map(t => <option key={t._id} value={t._id}>{t.nombre}{!t.activo ? " (inactivo)" : ""}</option>)}</select></div>
              </div>
            </section>
            <section id="trabajo-fechas" className="scroll-mt-4 rounded-2xl border border-[#cbd4e6] bg-white p-5 shadow-[0_8px_30px_rgba(25,45,90,.10)] sm:p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-[#a33d63]"><CalendarDays size={23}/></span><div><h3 className="text-xl font-extrabold text-slate-900">Fechas y seguimiento</h3><p className="text-sm text-slate-500">Define cuándo comienza y cuándo debe entregarse.</p></div></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label className={claseEtiqueta} htmlFor="inicio-trabajo">Fecha de inicio <span className="text-rose-600">*</span></label><input id="inicio-trabajo" name="fechaInicio" type="date" required className={claseCampo} value={datos.fechaInicio} onChange={cambiar}/></div>
                <div><label className={claseEtiqueta} htmlFor="fin-trabajo">Fecha de entrega <span className="text-rose-600">*</span></label><input id="fin-trabajo" name="fechaFinal" type="date" min={datos.fechaInicio || undefined} required className={claseCampo} value={datos.fechaFinal} onChange={cambiar}/></div>
                <div className="sm:col-span-2"><label className={claseEtiqueta} htmlFor="estado-trabajo">Etapa actual</label><select id="estado-trabajo" name="estado" className={claseCampo} value={datos.estado} onChange={cambiar}>{etapas.map(([id,nombre]) => <option key={id} value={id}>{nombre}</option>)}</select></div>
              </div>
            </section>
          </div>
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-10px_25px_rgba(15,23,42,.06)] sm:px-8">
            <p className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex"><Check size={18} className="text-emerald-600"/> Los campos con * son obligatorios</p>
            <div className="flex w-full justify-end gap-3 sm:w-auto"><button type="button" onClick={onClose} className="rounded-xl border-2 border-slate-200 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={saving || enlaceInvalido} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#124B91] to-[#64417c] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110 disabled:opacity-50">{saving ? "Guardando..." : trabajo ? "Guardar cambios" : "Crear trabajo"}<ArrowRight size={18}/></button></div>
          </footer>
        </form>
      </div>
    </div>
  </div>;
}
