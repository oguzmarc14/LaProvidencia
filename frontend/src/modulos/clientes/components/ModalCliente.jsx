import { useState } from "react";
import { X } from "lucide-react";
export default function ModalCliente({ cliente, guardar, cerrar, guardando }) {
  const [form, setForm] = useState({ nombre: cliente?.nombre || "", whatsapp: cliente?.whatsapp || "", direccion: cliente?.direccion || "" });
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4" onMouseDown={e => { if(e.target===e.currentTarget) cerrar(); }}>
    <form onSubmit={e => { e.preventDefault(); guardar(form); }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-5 flex justify-between"><h2 className="text-xl font-bold">{cliente ? "Editar cliente" : "Nuevo cliente"}</h2><button type="button" onClick={cerrar} aria-label="Cerrar"><X/></button></div>
      {["nombre","whatsapp","direccion"].map(campo => <label key={campo} className="mb-4 block text-sm font-semibold capitalize">{campo}{campo!=="nombre" && <span className="font-normal text-slate-400"> (opcional)</span>}<input required={campo==="nombre"} value={form[campo]} onChange={e => setForm({...form,[campo]:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#a53d64]"/></label>)}
      <div className="flex justify-end gap-3 pt-3"><button type="button" onClick={cerrar} className="rounded-xl border px-4 py-2">Cancelar</button><button disabled={guardando || !form.nombre.trim()} className="rounded-xl bg-[#204787] px-4 py-2 font-semibold text-white disabled:opacity-50">{guardando ? "Guardando..." : "Guardar"}</button></div>
    </form></div>;
}
