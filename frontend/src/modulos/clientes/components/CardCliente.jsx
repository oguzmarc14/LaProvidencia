import { Pencil, MapPin, MessageCircle, UserRound, ExternalLink, Navigation } from "lucide-react";
import { enlaceMaps, enlaceWhatsApp } from "../utils/enlacesCliente";

export default function CardCliente({ cliente, editar }) {
  const maps = enlaceMaps(cliente.ubicacionMaps);
  const whatsapp = enlaceWhatsApp(cliente.whatsapp);
  return <article className="brand-card group">
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 p-3 text-[#a33d63]"><UserRound size={25}/></span>
        <button onClick={() => editar(cliente)} className="flex items-center gap-2 rounded-xl border-2 border-[#b9c9e3] bg-blue-50 px-3 py-2 text-sm font-bold text-[#124B91] hover:bg-blue-100"><Pencil size={15}/> Editar</button>
      </div>
      <h3 className="break-words text-xl font-extrabold text-slate-900">{cliente.nombre}</h3>
      <div className="mt-5 space-y-3 rounded-xl border border-[#e2e7f1] bg-gradient-to-br from-[#f2f6fc] to-[#faf3f8] p-4 text-sm font-medium text-slate-700">
        <p className="flex items-center gap-3"><MessageCircle size={18} className="shrink-0 text-[#124B91]"/>{cliente.whatsapp || "Sin WhatsApp registrado"}</p>
        <p className="flex items-start gap-3"><MapPin size={18} className="shrink-0 text-[#a33d63]"/><span className="break-words">{cliente.direccion || "Sin dirección registrada"}</span></p>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#128C56] px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-green-900/10 transition hover:bg-[#0e7548]"><MessageCircle size={18}/> WhatsApp <ExternalLink size={14}/></a> : <span title="Agrega un número válido para contactar" className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"><MessageCircle size={18}/> Sin WhatsApp</span>}
        {maps ? <a href={maps} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#124B91] to-[#64417c] px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-900/10 transition hover:brightness-110"><Navigation size={18}/> Ver ubicación <ExternalLink size={14}/></a> : <span title="Agrega el enlace de Google Maps para ver la ubicación exacta" className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"><MapPin size={18}/> Sin ubicación</span>}
      </div>
    </div>
  </article>;
}
