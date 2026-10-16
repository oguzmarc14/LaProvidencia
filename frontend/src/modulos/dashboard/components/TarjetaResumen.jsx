export default function TarjetaResumen({ titulo, valor, icono: Icono, detalle, color = "blue" }) {
  const estilos = {
    blue: ["from-blue-100 to-indigo-50","text-[#124B91]","bg-[#124B91]"],
    emerald: ["from-emerald-100 to-teal-50","text-emerald-700","bg-emerald-600"],
    amber: ["from-amber-100 to-orange-50","text-amber-700","bg-amber-500"],
    violet: ["from-violet-100 to-fuchsia-50","text-violet-700","bg-violet-600"]
  };
  const [fondo, texto, barra] = estilos[color] || estilos.blue;
  return <article className="group relative overflow-hidden rounded-[22px] border border-[#cbd4e6] bg-white p-6 shadow-[0_10px_28px_rgba(25,45,90,.09)] transition hover:-translate-y-1 hover:shadow-xl">
    <div className={`absolute right-0 top-0 h-28 w-28 rounded-bl-[80px] bg-gradient-to-br ${fondo} opacity-70`}/>
    <div className="relative flex items-start justify-between gap-3"><p className="max-w-[70%] text-sm font-extrabold text-[#344766]">{titulo}</p><span className={`rounded-2xl bg-gradient-to-br ${fondo} p-3 ${texto}`}><Icono size={25}/></span></div>
    <p className="relative mt-5 text-4xl font-black tracking-tight text-slate-900">{valor ?? "—"}</p>
    <p className="relative mt-2 text-sm font-medium text-slate-500">{detalle}</p>
    <div className={`absolute inset-x-0 bottom-0 h-1 ${barra}`}/>
  </article>;
}
