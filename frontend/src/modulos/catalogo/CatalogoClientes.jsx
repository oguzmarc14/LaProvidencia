import EtiquetasCategoria, { colorCategoria } from "./EtiquetasCategoria";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ChevronLeft, ChevronRight, Layers3, Maximize2, MessageCircle, Palette, Phone, Ruler, Tag, X } from "lucide-react";
import { catalogoClientes, categorias, apartadosCatalogo, nombreCategoria } from "./catalogoService";
import PortadaProvidencia from "./PortadaProvidencia";
import { telefono } from "./datosSitio";
const botonOscuro = "inline-flex items-center justify-center gap-3 rounded-full catalogo-boton px-5 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110";

function whatsappUrl(numero, mensaje) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function BotonWhatsApp({ producto, whatsapp, amplio = false }) {
  return (
    <a className={`lp-whatsapp ${amplio ? "lp-whatsapp-amplio" : ""}`}
      href={whatsappUrl(whatsapp, `Hola, me interesa cotizar: ${producto.nombre}.`)}
      target="_blank" rel="noreferrer" aria-label={`Cotizar ${producto.nombre} por WhatsApp`}>
      <span className="lp-whatsapp-icono" aria-hidden="true"><MessageCircle size={26}/><Phone size={12}/></span>
      {amplio && "Cotizar por WhatsApp"}
    </a>
  );
}

function FotoProducto({ producto, indice = 0 }) {
  const imagen = producto.imagenes[indice];
  return imagen ? <img className="lp-foto-producto" src={imagen} alt={`${producto.nombre}, foto ${indice + 1}`} loading="lazy"/> : null;
}

function Tarjeta({ producto, whatsapp, abrir, categoriasApartado }) {
  const categoria = categoriasApartado.includes(producto.categoria) ? producto.categoria : "Otros";
  const color = colorCategoria(categoriasApartado.indexOf(categoria) + 1);
  return (
    <article className="lp-producto">
      <button className="lp-producto-abrir" type="button" onClick={() => abrir(producto)}
        aria-label={`Ver detalles de ${producto.nombre}`} aria-haspopup="dialog">
        <FotoProducto producto={producto}/>
        <div className="lp-producto-texto">
          <span className={`mb-2 inline-block self-start rounded-full px-3 py-1 text-xs font-bold ${color}`}>{nombreCategoria(categoria)}</span>
          <h4>{producto.nombre}</h4>
          {producto.precio != null && <p className="lp-precio">{producto.precioDesde && "Desde "}{precioFicha.format(producto.precio)} MXN/{producto.unidad}</p>}
          <p className="lp-producto-resumen">{producto.caracteristicas}</p>
        </div>
      </button>
      <div className="lp-producto-acciones">
        <button type="button" className="lp-ver-mas" onClick={() => abrir(producto)} aria-haspopup="dialog">
          Ver más <ChevronRight size={18} aria-hidden="true"/>
        </button>
        <BotonWhatsApp producto={producto} whatsapp={whatsapp}/>
      </div>
    </article>
  );
}

const precioFicha = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 2,
});

export function FichaProducto({ producto, whatsapp, cerrar }) {
  const dialogo = useRef(null);
  const [foto, setFoto] = useState(0);
  const acabados = (producto.acabados ?? "").split(",").map(acabado => acabado.trim()).filter(Boolean);
  const total = producto.imagenes.length;
  const mover = paso => setFoto(actual => (actual + paso + total) % total);
  useEffect(() => {
    const elemento = dialogo.current;
    elemento.showModal();
    return () => elemento.close();
  }, []);
  return (
    <dialog ref={dialogo} className="lp-ficha" aria-labelledby="lp-ficha-titulo"
      onCancel={cerrar} onClick={e => { if (e.target === e.currentTarget) cerrar(); }}
      onKeyDown={e => {
        if (total < 2) return;
        if (e.key === "ArrowLeft") mover(-1);
        if (e.key === "ArrowRight") mover(1);
      }}>
      <div className="lp-ficha-contenido">
        <button type="button" className="lp-ficha-cerrar" aria-label="Cerrar ficha" onClick={cerrar}>Cerrar <X size={21} aria-hidden="true"/></button>
        <div className="lp-ficha-galeria">
          <div className="lp-ficha-foto">
            {total ? <FotoProducto producto={producto} indice={foto}/> : <p className="grid min-h-40 place-items-center text-slate-600">Sin fotografía</p>}
            {total > 1 && <>
              <button type="button" className="lp-ficha-anterior" aria-label="Foto anterior" onClick={() => mover(-1)}><ChevronLeft/></button>
              <button type="button" className="lp-ficha-siguiente" aria-label="Foto siguiente" onClick={() => mover(1)}><ChevronRight/></button>
            </>}
          </div>
          {total > 1 && <div className="lp-ficha-miniaturas">
            {producto.imagenes.map((imagen, i) => <button key={i} type="button" aria-label={`Ver foto ${i + 1}`} aria-pressed={foto === i} onClick={() => setFoto(i)}><img src={imagen} alt=""/></button>)}
          </div>}
        </div>
        <div className="lp-ficha-datos">
          <h3 id="lp-ficha-titulo">{producto.nombre}</h3>
          {producto.precio != null && <div className="lp-ficha-precio">
            <Tag size={23} aria-hidden="true"/>
            {producto.precioDesde && <span>Desde</span>}
            <strong>{precioFicha.format(producto.precio)}</strong>
            <span className="lp-ficha-moneda">MXN/{producto.unidad}</span>
          </div>}
          {producto.caracteristicas && <p className="lp-ficha-descripcion">{producto.caracteristicas}</p>}
          <dl className="lp-ficha-especificaciones">
            <div><Layers3 size={27} aria-hidden="true"/><span><dt>{producto.material ? "Tipo de material" : "Categoría"}</dt><dd>{producto.material || nombreCategoria(producto.categoria)}</dd></span></div>
            {(producto.presentacion || producto.unidad) && <div><Maximize2 size={27} aria-hidden="true"/><span><dt>{producto.presentacion ? "Presentación" : "Unidad de venta"}</dt><dd>{producto.presentacion || producto.unidad}</dd></span></div>}
            {producto.medidas && <div><Ruler size={23} aria-hidden="true"/><span><dt>Dimensiones</dt><dd>{producto.medidas}</dd></span></div>}
            {acabados.length > 0 && <div className="lp-ficha-acabados"><Palette size={27} aria-hidden="true"/><span><dt>Acabados</dt><dd>{acabados.map((acabado, i) => <span key={i}>{acabado}</span>)}</dd></span></div>}
          </dl>
          {whatsapp && <BotonWhatsApp producto={producto} whatsapp={whatsapp} amplio/>}
        </div>
      </div>
    </dialog>
  );
}

export default function CatalogoClientes({ abrirCatalogo = false }) {
  const [catalogo, setCatalogo] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [productoAbierto, setProductoAbierto] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [apartadoActivo, setApartadoActivo] = useState("");

  useEffect(() => {
    const observador = new IntersectionObserver(entradas => {
      const visible = entradas.find(entrada => entrada.isIntersecting);
      if (visible) setApartadoActivo(visible.target.id);
    }, { rootMargin: "-25% 0px -60% 0px" });
    for (const { id } of apartadosCatalogo) {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    }
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    const titulo = document.title;
    document.title = abrirCatalogo
      ? "Catálogo | Mármoles y Granitos La Providencia"
      : "Mármoles y Granitos La Providencia";
    const desplazamiento = abrirCatalogo && !window.location.hash
      ? requestAnimationFrame(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "instant" }))
      : null;
    return () => {
      document.title = titulo;
      if (desplazamiento !== null) cancelAnimationFrame(desplazamiento);
    };
  }, [abrirCatalogo]);

  useEffect(() => {
    const consulta = new AbortController();
    catalogoClientes("/productos", { signal: consulta.signal })
      .then((datos) => { if (!consulta.signal.aborted) setCatalogo(datos); })
      .catch((e) => { if (!consulta.signal.aborted) setError(e.message); });
    return () => consulta.abort();
  }, [intento]);

  const secciones = new Map(categorias.map((nombre, i) => [nombre, { id: `seccion-${i}`, productos: [] }]));
  for (const producto of catalogo?.productos ?? []) {
    const seccion = secciones.get(producto.categoria) ?? secciones.get("Otros");
    seccion.productos.push(producto);
  }
  const apartados = apartadosCatalogo.map(apartado => ({ ...apartado,
    secciones: apartado.categorias.map(nombre => ({ nombre, ...secciones.get(nombre) })),
  }));
  const whatsapp = catalogo?.whatsapp || "52" + telefono.replaceAll(" ", "");

  return (
    <PortadaProvidencia>
    <section id="catalogo" aria-labelledby="catalogo-titulo" className="lp-productos scroll-mt-32 border-y border-[var(--marca-linea)] bg-white md:scroll-mt-24">
      <div className="lp-ancho py-14 sm:py-20">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-[var(--marca-acento)]">Productos</p>
        <h2 id="catalogo-titulo" className="font-serif text-4xl tracking-tight sm:text-5xl">Explora el catálogo</h2>
        {!error && !catalogo && <p role="status" className="mt-6 text-slate-600">Consultando productos publicados…</p>}
        {error && (
          <div className="mt-6 space-y-3 rounded-2xl border border-[var(--marca-linea)] p-6">
            <p role="alert" className="text-sm text-rose-700">No se pudieron cargar los productos publicados.</p>
            <button className={botonOscuro} onClick={() => { setError(""); setIntento(actual => actual + 1); }}>Reintentar</button>
          </div>
        )}
          <>
            <nav aria-label="Secciones del catálogo" className="lp-catalogo-nav">
              {apartados.map(({ nombre, id }) => (
                <a key={id} href={`#${id}`} aria-current={apartadoActivo === id ? "location" : undefined} onClick={() => setApartadoActivo(id)}>{nombre} <ArrowDownRight size={14} aria-hidden="true" /></a>
              ))}
            </nav>
            <div className="space-y-14 sm:space-y-20">
              {apartados.map(({ nombre, id, secciones: subsecciones }) => (
                <section key={id} id={id} aria-labelledby={`${id}-titulo`} className="lp-catalogo-apartado">
                  <h3 id={`${id}-titulo`} className="mb-5 border-t border-[var(--marca-linea)] pt-8 font-serif text-3xl sm:pt-12">{nombre}</h3>
                  <EtiquetasCategoria categorias={subsecciones.map(s => s.nombre)} activa={filtros[id] || ""}
                    seleccionar={categoria => setFiltros(previo => ({ ...previo, [id]: categoria }))} />
                  {catalogo && (() => {
                    const productos = subsecciones.filter(s => !filtros[id] || filtros[id] === s.nombre).flatMap(s => s.productos);
                    return productos.length ? (
                      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {productos.map(producto => <Tarjeta key={producto._id} producto={producto} whatsapp={whatsapp} abrir={setProductoAbierto} categoriasApartado={subsecciones.map(s => s.nombre)}/>)}
                      </div>
                    ) : <p className="mt-5 text-sm text-slate-600">Aún no hay productos publicados aquí.</p>;
                  })()}
                </section>
              ))}
            </div>
          </>
      </div>
    </section>
    {productoAbierto && <FichaProducto producto={productoAbierto} whatsapp={whatsapp} cerrar={() => setProductoAbierto(null)}/>}
    </PortadaProvidencia>
  );
}
