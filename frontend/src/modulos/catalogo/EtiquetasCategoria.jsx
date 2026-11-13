import { nombreCategoria } from "./catalogoService";

const colores = ["bg-sky-100 text-sky-900", "bg-amber-100 text-amber-900", "bg-emerald-100 text-emerald-900", "bg-violet-100 text-violet-900", "bg-rose-100 text-rose-900"];

export default function EtiquetasCategoria({ categorias, activa, seleccionar }) {
  return <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
    {["", ...categorias].map((categoria, indice) => (
      <button key={categoria} type="button" aria-pressed={activa === categoria} onClick={() => seleccionar(categoria)}
        className={`rounded-full px-3.5 py-2 text-sm font-semibold transition hover:brightness-95 ${activa === categoria ? "bg-slate-900 text-white" : colores[indice % colores.length]}`}>
        {categoria ? nombreCategoria(categoria) : "Todas"}
      </button>
    ))}
  </div>;
}
