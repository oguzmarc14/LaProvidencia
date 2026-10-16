import { Pencil, MapPin, MessageCircle, UserRound } from "lucide-react";
export default function CardCliente({ cliente, editar }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between"><span className="rounded-xl bg-rose-50 p-3 text-[#a53d64]"><UserRound/></span><button onClick={() => editar(cliente)} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Pencil size={15}/> Editar</button></div>
    <h3 className="text-lg font-bold">{cliente.nombre}</h3><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MessageCircle size={16}/>{cliente.whatsapp || "Sin WhatsApp"}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin size={16}/>{cliente.direccion || "Sin dirección"}</p>
  </article>;
}
