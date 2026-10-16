import { X, UserRoundPlus, Phone, UserRound, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ModalTrabajador({ trabajador, onClose, onSave, saving }) {
  const [form, setForm] = useState({ nombre: "", whatsapp: "", activo: true });
  useEffect(() => {
    setForm({ nombre: trabajador?.nombre || "", whatsapp: trabajador?.whatsapp || "", activo: trabajador?.activo ?? true });
  }, [trabajador]);

  const enviar = event => {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({ ...form, nombre: form.nombre.trim(), whatsapp: form.whatsapp.trim() });
  };

  const campo = "w-full rounded-xl border-2 border-[#c8d3e7] bg-[#f7f9fd] px-4 py-3.5 text-base font-medium text-slate-800 outline-none transition focus:border-[#124B91] focus:ring-4 focus:ring-blue-100";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1631]/80 p-3 backdrop-blur-[6px] sm:p-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-trabajador" className="w-full max-w-2xl overflow-hidden rounded-[26px] bg-white shadow-[0_30px_90px_rgba(6,17,43,.4)]">
        <header className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#9d4165] px-6 py-6 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden rounded-2xl bg-white/15 p-3 sm:block"><UserRoundPlus size={27}/></div>
            <div><p className="text-xs font-extrabold uppercase tracking-[.17em] text-white/80">La Providencia · Personal</p><h2 id="titulo-trabajador" className="mt-1 text-2xl font-extrabold sm:text-[28px]">{trabajador ? "Editar trabajador" : "Registrar trabajador"}</h2><p className="mt-1 text-sm text-white/80">Mantén actualizado el equipo de trabajo.</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="shrink-0 rounded-xl bg-white/15 p-3 hover:bg-white/25"><X size={22}/></button>
        </header>
        <form onSubmit={enviar}>
          <div className="space-y-5 bg-[radial-gradient(ellipse_at_top_right,rgba(163,61,99,.13),transparent_60%),linear-gradient(145deg,#edf1fa,#f7eef5)] p-5 sm:p-8">
            <section className="rounded-2xl border border-[#cbd4e6] bg-white p-5 shadow-[0_8px_30px_rgba(25,45,90,.10)] sm:p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-[#124B91]"><UserRound size={22}/></span>
                <div><h3 className="text-lg font-extrabold text-slate-900">Datos del trabajador</h3><p className="text-sm text-slate-500">Información para identificarlo y contactarlo.</p></div>
              </div>
              <div className="space-y-5">
                <div><label htmlFor="nombre-trabajador" className="mb-2 block text-sm font-extrabold text-[#233d65]">Nombre completo <span className="text-rose-600">*</span></label><input id="nombre-trabajador" required autoFocus maxLength={120} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={campo} placeholder="Ej. José Martínez" autoComplete="name"/></div>
                <div><label htmlFor="whatsapp-trabajador" className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#233d65]"><Phone size={16}/> WhatsApp <span className="font-medium text-slate-400">(opcional)</span></label><input id="whatsapp-trabajador" type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className={campo} placeholder="Ej. 449 123 4567" autoComplete="tel"/></div>
                {trabajador && <label className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-[#233d65]"><input type="checkbox" className="h-5 w-5 accent-[#124B91]" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })}/> Trabajador activo</label>}
              </div>
            </section>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-5 sm:px-8">
            <span className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex"><CheckCircle2 size={18} className="text-emerald-600"/> Los campos con * son obligatorios</span>
            <div className="ml-auto flex gap-3"><button type="button" onClick={onClose} className="rounded-xl border-2 border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={saving || !form.nombre.trim()} className="rounded-xl bg-gradient-to-r from-[#124B91] to-[#64417c] px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110 disabled:opacity-50">{saving ? "Guardando..." : trabajador ? "Guardar cambios" : "Registrar trabajador"}</button></div>
          </footer>
        </form>
      </div>
    </div>
  );
}
