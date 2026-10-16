import { useState } from "react";
import { X, UserRoundPlus, UserRound, Phone, MapPin, CheckCircle2, Navigation, ExternalLink } from "lucide-react";
import { enlaceMaps } from "../utils/enlacesCliente";

export default function ModalCliente({ cliente, guardar, cerrar, guardando }) {
  const [form, setForm] = useState({ nombre: cliente?.nombre || "", whatsapp: cliente?.whatsapp || "", direccion: cliente?.direccion || "", ubicacionMaps: cliente?.ubicacionMaps || "" });
  const cambiar = e => setForm(actual => ({ ...actual, [e.target.name]: e.target.value }));
  const maps = enlaceMaps(form.ubicacionMaps);
  const enlaceInvalido = !!form.ubicacionMaps.trim() && !maps;
  const enviar = e => {
    e.preventDefault();
    if (!form.nombre.trim() || enlaceInvalido) return;
    guardar({ nombre: form.nombre.trim(), whatsapp: form.whatsapp.trim(), direccion: form.direccion.trim(), ubicacionMaps: form.ubicacionMaps.trim() });
  };
  const campo = "w-full rounded-xl border-2 border-[#c8d3e7] bg-[#f7f9fd] px-4 py-3.5 text-base font-medium text-slate-800 outline-none transition focus:border-[#124B91] focus:ring-4 focus:ring-blue-100";
  const etiqueta = "mb-2 flex items-center gap-2 text-sm font-extrabold text-[#233d65]";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1631]/80 p-3 backdrop-blur-[6px] sm:p-6" onMouseDown={e => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-cliente" className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_30px_90px_rgba(6,17,43,.4)]">
        <header className="flex shrink-0 items-center justify-between gap-4 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#9d4165] px-6 py-6 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden rounded-2xl bg-white/15 p-3 sm:block"><UserRoundPlus size={27}/></div>
            <div><p className="text-xs font-extrabold uppercase tracking-[.17em] text-white/80">La Providencia · Clientes</p><h2 id="titulo-cliente" className="mt-1 text-2xl font-extrabold sm:text-[28px]">{cliente ? "Editar cliente" : "Registrar cliente"}</h2><p className="mt-1 text-sm text-white/80">Datos de contacto y ubicación exacta del cliente.</p></div>
          </div>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="shrink-0 rounded-xl bg-white/15 p-3 hover:bg-white/25"><X size={22}/></button>
        </header>
        <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(163,61,99,.13),transparent_60%),linear-gradient(145deg,#edf1fa,#f7eef5)] p-5 sm:p-8">
            <section className="rounded-2xl border border-[#cbd4e6] bg-white p-5 shadow-[0_8px_30px_rgba(25,45,90,.10)] sm:p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-[#124B91]"><UserRound size={22}/></span><div><h3 className="text-lg font-extrabold text-slate-900">Datos del cliente</h3><p className="text-sm text-slate-500">Información para contactarlo y localizarlo.</p></div></div>
              <div className="space-y-5">
                <div><label htmlFor="nombre-cliente" className={etiqueta}><UserRound size={16}/> Nombre completo <span className="text-rose-600">*</span></label><input id="nombre-cliente" name="nombre" required autoFocus maxLength={120} autoComplete="name" value={form.nombre} onChange={cambiar} className={campo} placeholder="Ej. María González"/></div>
                <div><label htmlFor="whatsapp-cliente" className={etiqueta}><Phone size={16}/> WhatsApp <span className="font-medium text-slate-400">(opcional)</span></label><input id="whatsapp-cliente" name="whatsapp" type="tel" autoComplete="tel" value={form.whatsapp} onChange={cambiar} className={campo} placeholder="Ej. 449 123 4567"/></div>
                <div><label htmlFor="direccion-cliente" className={etiqueta}><MapPin size={16}/> Dirección <span className="font-medium text-slate-400">(opcional)</span></label><input id="direccion-cliente" name="direccion" autoComplete="street-address" value={form.direccion} onChange={cambiar} className={campo} placeholder="Ej. Calle Hidalgo 120, Centro"/></div>
                <div className="rounded-xl border border-[#d7deec] bg-[#f5f7fd] p-4">
                  <label htmlFor="ubicacion-maps-cliente" className={etiqueta}><Navigation size={16}/> Ubicación exacta (Google Maps) <span className="font-medium text-slate-400">(opcional)</span></label>
                  <input id="ubicacion-maps-cliente" name="ubicacionMaps" type="url" value={form.ubicacionMaps} onChange={cambiar} aria-invalid={enlaceInvalido} aria-describedby="ayuda-maps" className={campo} placeholder="https://maps.app.goo.gl/..."/>
                  <p id="ayuda-maps" className={`mt-2 text-xs ${enlaceInvalido ? "font-semibold text-red-600" : "text-slate-500"}`}>{enlaceInvalido ? "Pega un enlace HTTPS válido de Google Maps." : "En Google Maps, selecciona Compartir → Copiar enlace y pégalo aquí."}</p>
                  {maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-[#124B91] hover:underline"><ExternalLink size={15}/> Comprobar ubicación en Maps</a>}
                </div>
              </div>
            </section>
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-5 sm:px-8">
            <span className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex"><CheckCircle2 size={18} className="text-emerald-600"/> Los campos con * son obligatorios</span>
            <div className="ml-auto flex gap-3"><button type="button" onClick={cerrar} className="rounded-xl border-2 border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={guardando || !form.nombre.trim() || enlaceInvalido} className="rounded-xl bg-gradient-to-r from-[#124B91] to-[#64417c] px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110 disabled:opacity-50">{guardando ? "Guardando..." : cliente ? "Guardar cambios" : "Registrar cliente"}</button></div>
          </footer>
        </form>
      </div>
    </div>
  );
}
