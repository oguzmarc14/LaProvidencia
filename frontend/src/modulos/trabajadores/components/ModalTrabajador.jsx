import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ModalTrabajador({ trabajador, onClose, onSave, saving }) {
  const [form, setForm] = useState({ nombre: "", whatsapp: "", activo: true });
  useEffect(() => {
    setForm({
      nombre: trabajador?.nombre || "",
      whatsapp: trabajador?.whatsapp || "",
      activo: trabajador?.activo ?? true,
    });
  }, [trabajador]);

  const enviar = (event) => {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={enviar} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" aria-label={trabajador ? "Editar trabajador" : "Nuevo trabajador"}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{trabajador ? "Editar trabajador" : "Registrar trabajador"}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button>
        </div>
        <label className="mb-4 block text-sm font-medium">Nombre completo
          <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-600" />
        </label>
        <label className="mb-4 block text-sm font-medium">WhatsApp (opcional)
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-600" />
        </label>
        {trabajador && <label className="mb-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Trabajador activo</label>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">Cancelar</button>
          <button disabled={saving || !form.nombre.trim()} className="rounded-xl bg-[#124B91] px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}
