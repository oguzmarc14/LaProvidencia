import { useState } from "react";
import { X } from "lucide-react";
export default function ModalCliente({ cliente, guardar, cerrar, guardando }) {
  const [form, setForm] = useState({ nombre: cliente?.nombre || "", whatsapp: cliente?.whatsapp || "", direccion: cliente?.direccion || "" });
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4" onMouseDown={e => { if(e.target===e.currentTarget) cerrar(); }}>
    <form onSubmit={e => { e.preventDefault(); guardar(form); }} className="w-full max-w-lg app-modal max-w-lg p-6">
      <div className="mb-5 flex justify-between"><h2 className="text-xl font-bold">{cliente ? "Editar cliente" : "Nuevo cliente"}</h2><button type="button" onClick={cerrar} aria-label="Cerrar"><X/></button></div>
      {["nombre","whatsapp","direccion"].map(campo => <label key={campo} className="mb-4 block text-sm font-semibold capitalize">{campo}{campo!=="nombre" && <span className="font-normal text-slate-400"> (opcional)</span>}<input required={campo==="nombre"} value={form[campo]} onChange={e => setForm({...form,[campo]:e.target.value})} className="mt-2 w-full app-field mt-2 font-normal"/></label>)}
      <div className="flex justify-end gap-3 pt-3"><button type="button" onClick={cerrar} className="rounded-xl border px-4 py-2">Cancelar</button><button disabled={guardando || !form.nombre.trim()} className="app-primary rounded-xl px-4 py-2 font-semibold disabled:opacity-50">{guardando ? "Guardando..." : "Guardar"}</button></div>
    </form></div>;
}
