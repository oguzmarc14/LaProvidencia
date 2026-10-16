import { Pencil, MapPin, MessageCircle, UserRound } from "lucide-react";
export default function CardCliente({ cliente, editar }) {
  return <article className="group overflow-hidden rounded-[24px] border border-[#cbd4e6] bg-white shadow-[0_12px_32px_rgba(25,45,90,.12)] transition duration-200 hover:-translate-y-1 hover:border-[#9f8abf] hover:shadow-xl">
    <div className="h-1.5 bg-gradient-to-r from-[#124B91] via-[#64417c] to-[#a33d63]"/>
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between gap-3"><span className="rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 p-3 text-[#a33d63]"><UserRound size={25}/></span><button onClick={() => editar(cliente)} className="flex items-center gap-2 rounded-xl border-2 border-[#b9c9e3] bg-blue-50 px-3 py-2 text-sm font-bold text-[#124B91] hover:bg-blue-100"><Pencil size={15}/> Editar</button></div>
      <h3 className="break-words text-xl font-extrabold text-slate-900">{cliente.nombre}</h3>
      <div className="mt-5 space-y-3 rounded-xl border border-[#e2e7f1] bg-gradient-to-br from-[#f2f6fc] to-[#faf3f8] p-4 text-sm font-medium text-slate-700"><p className="flex items-center gap-3"><MessageCircle size={18} className="shrink-0 text-[#124B91]"/>{cliente.whatsapp || "Sin WhatsApp registrado"}</p><p className="flex items-start gap-3"><MapPin size={18} className="shrink-0 text-[#a33d63]"/><span className="break-words">{cliente.direccion || "Sin dirección registrada"}</span></p></div>
    </div>
  </article>;
}
