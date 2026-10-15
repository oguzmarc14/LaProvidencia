export default function TarjetaResumen({ titulo, valor, icono: Icono, detalle, color = "blue" }) {
  const fondos = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700" };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{titulo}</p>
        <div className={`rounded-xl p-3 ${fondos[color] || fondos.blue}`}><Icono size={21} /></div>
      </div>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{valor}</p>
      <p className="mt-1 text-xs text-slate-500">{detalle}</p>
    </article>
  );
}
