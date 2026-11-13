import { useEffect, useState } from "react";
import { ArrowUpRight, Image, Pencil } from "lucide-react";
import { apartadosCatalogo, catalogoAdmin, enlaceCatalogo, moneda, nombreCategoria } from "./catalogoService";
import EtiquetasCategoria from "./EtiquetasCategoria";

export default function ProductosAdmin({ editar, nuevo }) {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState("");
  const [apartadoId, setApartadoId] = useState("");
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    let activo = true;
    catalogoAdmin("/productos")
      .then(datos => { if (activo) setProductos(datos.productos); })
      .catch(e => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, []);

  const apartado = apartadosCatalogo.find(item => item.id === apartadoId);
  const visibles = productos?.filter(producto =>
    (!apartado || apartado.categorias.includes(producto.categoria)) && (!categoria || producto.categoria === categoria));

  return <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header className="app-panel flex flex-wrap items-center justify-between gap-4 p-6">
      <h1 className="text-3xl font-extrabold">Productos</h1>
      <div className="flex flex-wrap gap-2">
      <button type="button" onClick={nuevo} className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-blue-800 hover:bg-blue-50">
        Nuevo producto
      </button>
      <a href={enlaceCatalogo} target="_blank" rel="noreferrer" className="app-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold">
        Ver catálogo público <ArrowUpRight size={18} aria-hidden="true" />
      </a>
      </div>
    </header>
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Secciones de productos">
        {[{ id: "", nombre: "Todos" }, ...apartadosCatalogo].map(item => (
          <button key={item.id} type="button" aria-pressed={apartadoId === item.id}
            className={`rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold ${apartadoId === item.id ? "app-primary" : "bg-white text-slate-700 hover:bg-slate-100"}`}
            onClick={() => { setApartadoId(item.id); setCategoria(""); }}>{item.nombre}</button>
        ))}
      </div>
      {apartado && <EtiquetasCategoria categorias={apartado.categorias} activa={categoria} seleccionar={setCategoria} />}
    </div>
    {error && <p role="alert" className="text-rose-800">{error}</p>}
    {!error && !productos && <p role="status">Cargando productos…</p>}
    {visibles?.length === 0 && <p className="text-slate-600">No hay productos en esta selección.</p>}
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {visibles?.map(producto => (
        <article key={producto._id} className="app-panel flex flex-col overflow-hidden">
          {producto.imagenes?.[0] ? (
            <img src={producto.imagenes[0]} alt={producto.nombre} className="aspect-[4/3] w-full object-cover" loading="lazy" />
          ) : <div className="grid aspect-[4/3] place-items-center bg-slate-100 text-slate-500"><Image size={36} aria-label="Sin foto" /></div>}
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-900">{nombreCategoria(producto.categoria)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-700">{producto.estado}</span>
            </div>
            <h2 className="text-xl font-extrabold">{producto.nombre}</h2>
            <p className="font-semibold">{producto.precioDesde && "Desde "}{moneda.format(producto.precio)} / {producto.unidad}</p>
            {producto.caracteristicas && <p className="whitespace-pre-line text-sm text-slate-600">{producto.caracteristicas}</p>}
            <dl className="space-y-1 text-sm text-slate-600">
              {[["Material", producto.material], ["Medidas", producto.medidas], ["Presentación", producto.presentacion], ["Acabados", producto.acabados]].filter(([, valor]) => valor).map(([titulo, valor]) => (
                <div key={titulo}><dt className="inline font-semibold">{titulo} </dt><dd className="inline">{valor}</dd></div>
              ))}
            </dl>
            <button type="button" onClick={() => editar(producto)} className="mt-auto inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2 font-semibold text-blue-800 hover:bg-blue-50">
              <Pencil size={16} aria-hidden="true" /> Editar
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>;
}
