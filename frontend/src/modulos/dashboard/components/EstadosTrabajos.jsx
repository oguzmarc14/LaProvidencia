export default function EstadosTrabajos({ estados = [], total = 0 }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Trabajos por etapa</h2>
      <p className="mt-1 text-sm text-slate-500">Distribución actual de los trabajos registrados</p>
      {estados.length === 0 ? <p className="mt-6 text-sm text-slate-500">Aún no hay trabajos registrados.</p> :
        <div className="mt-6 space-y-5">{estados.map((item) =>
          <div key={item.estado}>
            <div className="mb-2 flex justify-between gap-2 text-sm"><span className="capitalize font-medium text-slate-700">{item.estado}</span><span className="font-semibold text-slate-900">{item.total}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#124B91]" style={{ width: `${total ? (item.total / total) * 100 : 0}%` }} /></div>
          </div>)}</div>}
    </section>
  );
}
