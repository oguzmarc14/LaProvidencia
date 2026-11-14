import { FichaProducto } from "./CatalogoClientes";
import AlertaModal from "../../components/ui/AlertaModal";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronRight, Image, Pencil, Trash2 } from "lucide-react";
import { apartadosCatalogo, catalogoAdmin, enlaceCatalogo, moneda, nombreCategoria } from "./catalogoService";
import EtiquetasCategoria from "./EtiquetasCategoria";

export default function ProductosAdmin({ editar, nuevo }) {
  const [ficha, setFicha] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const [borrando, setBorrando] = useState(false);
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

  async function eliminar() {
    if (borrando || !alerta?.producto) return;
    setBorrando(true);
    const producto = alerta.producto;
    try {
      await catalogoAdmin(`/productos/${producto._id}`, "DELETE");
      setProductos(actuales => actuales.filter(item => item._id !== producto._id));
      setAlerta({ tipo: "success", titulo: "Producto eliminado", mensaje: producto.nombre });
    } catch (e) {
      setAlerta({ tipo: "error", titulo: "No se pudo eliminar el producto", mensaje: e.message });
    } finally {
      setBorrando(false);
    }
  }

  return <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white shadow-lg sm:p-9">
      <h1 className="text-3xl font-extrabold">Productos</h1>
      <div className="grid w-full gap-2 sm:flex sm:w-auto">
      <button type="button" onClick={nuevo} className="accion-ancho-movil rounded-xl bg-white px-5 py-3 text-center font-bold text-[#123e83] hover:bg-blue-50">
        Nuevo producto
      </button>
      <a href={enlaceCatalogo} target="_blank" rel="noreferrer" className="accion-ancho-movil inline-flex items-center justify-center gap-2 border border-white/40 hover:bg-white/15 rounded-xl px-5 py-3 font-bold">
        Ver catálogo público <ArrowUpRight size={18} aria-hidden="true" />
      </a>
      </div>
    </header>
    <div className="space-y-4">
      <div className="grid w-full gap-2 sm:flex sm:w-auto" role="group" aria-label="Secciones de productos">
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
    <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {visibles?.map(producto => (
        <article key={producto._id} className="brand-card flex min-w-0 flex-col overflow-hidden">
          <button type="button" onClick={() => setFicha(producto)} aria-haspopup="dialog"
            aria-label={`Ver ficha de ${producto.nombre}`} className="relative block w-full shrink-0 overflow-hidden text-center">
          {producto.imagenes?.[0] ? (
            <img src={producto.imagenes[0]} alt={producto.nombre} className="aspect-[4/3] w-full bg-slate-50 object-contain" loading="lazy" />
          ) : <div className="grid aspect-[4/3] place-items-center bg-slate-100 text-slate-500"><Image size={36} aria-label="Sin foto" /></div>}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-3 break-words p-5">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-900">{nombreCategoria(producto.categoria)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-700">{producto.estado}</span>
            </div>
            <h2 className="line-clamp-3 min-h-[3lh] font-serif text-2xl font-bold text-[#0b1b53]">{producto.nombre}</h2>
            <p className="self-start rounded-xl bg-[#fad8ee] px-3 py-2 font-extrabold text-[#0b1b53]">{producto.precioDesde && "Desde "}{moneda.format(producto.precio)} / {producto.unidad}</p>
            <div className="min-h-[3lh] text-sm text-slate-600"><p className="line-clamp-3 whitespace-pre-line">{producto.caracteristicas}</p></div>
            <button type="button" aria-haspopup="dialog" onClick={() => setFicha(producto)}
              className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b1b53] px-4 py-2 text-sm font-bold text-white hover:bg-[#193776]">
              Ver ficha <ChevronRight size={18} aria-hidden="true" />
            </button>
            <div className="grid grid-cols-1 gap-2 border-t sm:grid-cols-2 border-slate-100 pt-4">
            <button type="button" onClick={() => editar(producto)} className="accion-ancho-movil inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-blue-800 hover:bg-blue-50">
              <Pencil size={16} aria-hidden="true" /> Editar
            </button>
            <button type="button" onClick={() => setAlerta({
              tipo: "danger", titulo: "¿Eliminar producto?", confirmarTexto: "Eliminar producto", producto,
              mensaje: `Se eliminará «${producto.nombre}» del sistema y del catálogo. Esta acción es permanente.`,
            })} className="accion-ancho-movil inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 font-semibold text-rose-700 hover:bg-rose-50">
              <Trash2 size={16} aria-hidden="true" /> Eliminar
            </button>
            </div>
          </div>
        </article>
      ))}
    </div>
    {ficha && <div className="lp-sitio lp-vista-admin"><FichaProducto producto={ficha} cerrar={() => setFicha(null)} /></div>}
    <AlertaModal alerta={alerta} procesando={borrando} onConfirmar={eliminar} onCerrar={() => setAlerta(null)} />
  </section>;
}
