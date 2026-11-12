import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ChevronLeft, ChevronRight, Layers3, Maximize2, MessageCircle, Palette, Phone, Ruler, Tag, X } from "lucide-react";
import { catalogoClientes, categorias, apartadosCatalogo, nombreCategoria } from "./catalogoService";
import PortadaProvidencia from "./PortadaProvidencia";
import { telefono } from "./datosSitio";
import fotosEjemplos from "./fotos/ejemplos-catalogo.png";

const ejemplos = {
  cubiertas: [
    ["Granito negro pulido", "Para islas y barras de cocina con acabado oscuro."],
    ["Cuarzo blanco veteado", "Una opción de tono claro para cubiertas de cocina."],
    ["Porcelanato efecto mármol", "Superficie de apariencia marmoleada para una cubierta continua."],
  ],
  acabados: [
    ["Fachaleta de piedra clara", "Piezas delgadas para revestir un muro de acento."],
    ["Cantera beige", "Acabado de piedra para marcos y detalles de fachada."],
    ["Laja gris irregular", "Textura natural para muros de patios y jardines."],
  ],
  accesorios: [
    ["Tarja de acero inoxidable", "Cubeta sencilla para una zona de lavado compacta."],
    ["Monomando de cuello alto", "Llave de cocina con espacio para llenar ollas altas."],
    ["Campana de pared", "Para instalar sobre una parrilla de cocina."],
    ["Parrilla empotrable", "Equipo de cocción integrado en la cubierta."],
  ],
  banos: [
    ["Ovalín blanco sobre cubierta", "Lavabo de cerámica para un mueble de baño."],
    ["Monomando alto para ovalín", "Grifería con altura para un lavabo sobre cubierta."],
    ["Espejo con cantos pulidos", "Complemento para el área del lavabo."],
  ],
  "otros-productos": [
    ["Vidrio para repisa", "Pieza de vidrio cortada a la medida del proyecto."],
    ["Lápida de granito", "Ejemplo de pieza con acabado pulido y grabado personalizado."],
  ],
};

// Los datos y las fotos siguen el mismo orden que las referencias del catálogo.
const especificacionesEjemplos = [
  { precio: 4800, unidad: "m²", material: "Granito natural", presentacion: "Lámina", medidas: "300 × 180 cm · espesor 2 cm", acabados: "Pulido" },
  { precio: 5900, unidad: "m²", material: "Cuarzo ingenierizado", presentacion: "Lámina", medidas: "323 × 163 cm · espesor 2 o 3 cm", acabados: "Pulido, Mate, Satinado" },
  { precio: 4400, unidad: "m²", material: "Porcelanato", presentacion: "Lámina", medidas: "320 × 160 cm · espesor 12 mm", acabados: "Mate, Pulido" },
  { precio: 890, unidad: "m²", material: "Piedra natural", presentacion: "Panel de fachaleta", medidas: "15 × 60 cm por panel", acabados: "Rústico" },
  { precio: 1180, unidad: "m²", material: "Cantera natural", presentacion: "Placa", medidas: "40 × 60 cm · espesor 2 cm", acabados: "Apomazado, Rústico" },
  { precio: 760, unidad: "m²", material: "Laja natural", presentacion: "Piezas irregulares", medidas: "Piezas de 20 a 45 cm · espesor variable", acabados: "Natural" },
  { precio: 2450, unidad: "pieza", material: "Acero inoxidable", presentacion: "Tarja de una cubeta", medidas: "55 × 45 × 20 cm", acabados: "Cepillado" },
  { precio: 1890, unidad: "pieza", material: "Latón", presentacion: "Monomando para cocina", medidas: "Altura 38 cm · alcance 22 cm", acabados: "Cromado" },
  { precio: 6200, unidad: "pieza", material: "Acero inoxidable", presentacion: "Campana de pared", medidas: "60 × 48 cm", acabados: "Cepillado" },
  { precio: 5300, unidad: "pieza", material: "Vidrio templado y metal", presentacion: "Parrilla empotrable de gas", medidas: "60 × 51 cm", acabados: "Negro brillante" },
  { precio: 1490, unidad: "pieza", material: "Cerámica", presentacion: "Ovalín sobre cubierta", medidas: "48 × 36 × 14 cm", acabados: "Blanco brillante" },
  { precio: 1790, unidad: "pieza", material: "Latón", presentacion: "Monomando alto para lavabo", medidas: "Altura 30 cm · alcance 16 cm", acabados: "Cromado" },
  { precio: 1250, unidad: "pieza", material: "Vidrio espejado", presentacion: "Espejo rectangular", medidas: "60 × 80 cm · espesor 5 mm", acabados: "Cantos pulidos" },
  { precio: 690, unidad: "pieza", material: "Vidrio templado", presentacion: "Repisa rectangular", medidas: "60 × 20 cm · espesor 8 mm", acabados: "Cantos pulidos" },
  { precio: 3900, unidad: "pieza", material: "Granito natural", presentacion: "Placa con grabado", medidas: "60 × 40 cm · espesor 3 cm", acabados: "Pulido" },
];

const ejemplosConFicha = new Map();
const posicionesFotos = new Map();
let indiceFoto = 0;
for (const apartado of apartadosCatalogo) {
  const productos = ejemplos[apartado.id].map(([nombre, caracteristicas]) => {
    const especificaciones = especificacionesEjemplos[indiceFoto];
    posicionesFotos.set(nombre, `${(indiceFoto % 3) * 50}% ${Math.floor(indiceFoto / 3) * 25}%`);
    indiceFoto += 1;
    return {
      ...especificaciones,
      nombre,
      caracteristicas,
      categoria: apartado.nombre,
      precioDesde: true,
      imagenes: [],
      ilustrativo: true,
    };
  });
  ejemplosConFicha.set(apartado.id, productos);
}

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
  if (producto.ilustrativo) return (
    <div className="lp-foto-ejemplo" role="img" aria-label={`Imagen ilustrativa de ${producto.nombre.toLowerCase()}`}
      style={{ backgroundImage: `url("${fotosEjemplos}")`, backgroundPosition: posicionesFotos.get(producto.nombre) }}/>
  );
  const imagen = producto.imagenes[indice];
  return imagen ? <img className="lp-foto-producto" src={imagen} alt={`${producto.nombre}, foto ${indice + 1}`} loading="lazy"/> : null;
}

function Tarjeta({ producto, whatsapp, abrir }) {
  return (
    <article className="lp-producto">
      <button className="lp-producto-abrir" type="button" onClick={() => abrir(producto)}
        aria-label={`Ver detalles de ${producto.nombre}`} aria-haspopup="dialog">
        <FotoProducto producto={producto}/>
        <div className="lp-producto-texto">
          <h4>{producto.nombre}</h4>
          {producto.precio != null && <p className="lp-precio">{producto.precioDesde && "Desde "}{precioFicha.format(producto.precio)} MXN/{producto.unidad}</p>}
          {producto.ilustrativo && <p className="text-xs text-slate-600">Precio ilustrativo</p>}
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

function FichaProducto({ producto, whatsapp, cerrar }) {
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
            <FotoProducto producto={producto} indice={foto}/>
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
          {producto.ilustrativo && <p className="text-sm text-slate-600">{producto.precio != null ? "Ficha y precio ilustrativos" : "Referencia ilustrativa"}</p>}
          <BotonWhatsApp producto={producto} whatsapp={whatsapp} amplio/>
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
              {apartados.map(({ nombre, id, descripcion, secciones: subsecciones }) => (
                <section key={id} id={id} aria-labelledby={`${id}-titulo`} className="lp-catalogo-apartado">
                  <h3 id={`${id}-titulo`} className="mb-5 border-t border-[var(--marca-linea)] pt-8 font-serif text-3xl sm:pt-12">{nombre}</h3>
                  <p className="mb-4 text-sm text-[var(--marca-texto)]">{descripcion}</p>
                  <div className="mb-6 flex flex-wrap gap-2">{subsecciones.map(s => <span key={s.id} className="rounded-full bg-[var(--marca-suave)] px-3 py-1.5 text-xs font-semibold text-[var(--marca-oscuro)]">{nombreCategoria(s.nombre)}</span>)}</div>
                  {subsecciones.filter(s => s.productos.length).map(s => <div key={s.id} className="mb-7">
                    <h4 className="mb-4 text-lg font-bold text-[var(--marca-oscuro)]">{nombreCategoria(s.nombre)}</h4>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {s.productos.map(producto => <Tarjeta key={producto._id} producto={producto} whatsapp={whatsapp} abrir={setProductoAbierto}/>)}
                    </div>
                  </div>)}
                  <p className="mb-4 text-sm text-[var(--marca-texto)]">Referencias con precios y medidas ilustrativos. Solicita una cotización para tu proyecto.</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ejemplosConFicha.get(id).map(producto => (
                      <Tarjeta key={producto.nombre} producto={producto} whatsapp={whatsapp} abrir={setProductoAbierto}/>
                    ))}
                  </div>
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
