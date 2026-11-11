import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { catalogoClientes, categorias, apartadosCatalogo, nombreCategoria, moneda } from "./catalogoService";
import PortadaProvidencia from "./PortadaProvidencia";
import { telefono } from "./datosSitio";

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

const botonOscuro = "inline-flex items-center justify-center gap-3 rounded-full catalogo-boton px-5 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110";

function whatsappUrl(numero, mensaje) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function Tarjeta({ producto, whatsapp }) {
  const [foto, setFoto] = useState(0);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--marca-linea)] bg-white">
      <img className="aspect-[4/3] w-full bg-[var(--marca-suave)] object-contain" src={producto.imagenes[foto]} alt={`${producto.nombre}, foto ${foto + 1}`} loading="lazy" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {producto.imagenes.length > 1 && (
          <div className="flex gap-2">
            {producto.imagenes.map((imagen, i) => (
              <button key={i} type="button" aria-pressed={foto === i} aria-label={`Ver foto ${i + 1}`} onClick={() => setFoto(i)} className={`overflow-hidden rounded-lg border-2 ${foto === i ? "border-[var(--marca-azul)]" : "border-transparent"}`}>
                <img src={imagen} alt="" className="h-12 w-16 object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
        <h4 className="font-serif text-2xl text-[var(--marca-oscuro)]">{producto.nombre}</h4>
        <p className="font-bold text-[var(--marca-oscuro)]">{moneda.format(producto.precio)} MXN <span className="text-sm font-normal text-[var(--marca-texto)]">/ {producto.unidad}</span></p>
        {producto.medidas && <p className="text-sm font-medium text-[var(--marca-texto)]">Medidas · {producto.medidas}</p>}
        {producto.caracteristicas && <p className="whitespace-pre-line text-sm text-[var(--marca-texto)]">{producto.caracteristicas}</p>}
        {whatsapp && <a className="mt-auto inline-flex w-fit items-center gap-2 pt-2 text-sm font-bold text-[var(--marca-acento)] hover:underline" href={whatsappUrl(whatsapp, `Hola, me interesa cotizar: ${producto.nombre}.`)} target="_blank" rel="noreferrer">Cotizar producto <ArrowUpRight size={16} aria-hidden="true" /></a>}
      </div>
    </article>
  );
}

export default function CatalogoClientes() {
  const [catalogo, setCatalogo] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const titulo = document.title;
    const descripcion = document.createElement("meta");
    descripcion.name = "description";
    descripcion.content = "La Providencia fabrica e instala encimeras y superficies de mármol, granito y cuarzo. Consulta proyectos, productos y cotizaciones.";
    document.head.append(descripcion);
    document.title = "La Providencia | Encimeras de Mármol y Granito";
    return () => { document.title = titulo; descripcion.remove(); };
  }, []);

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
      <div className="lp-ancho py-8">
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
            <nav aria-label="Secciones del catálogo" className="mb-9 mt-6 flex flex-wrap gap-2">
              {apartados.map(({ nombre, id }) => (
                <a key={id} href={`#${id}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--marca-linea)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[var(--marca-suave)]">{nombre} <ArrowDownRight size={14} aria-hidden="true" /></a>
              ))}
            </nav>
            <div className="space-y-10">
              {apartados.map(({ nombre, id, descripcion, secciones: subsecciones }) => (
                <section key={id} id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-32 md:scroll-mt-24">
                  <h3 id={`${id}-titulo`} className="mb-4 border-t border-[var(--marca-linea)] pt-5 font-serif text-3xl">{nombre}</h3>
                  <p className="mb-4 text-sm text-[var(--marca-texto)]">{descripcion}</p>
                  <div className="mb-6 flex flex-wrap gap-2">{subsecciones.map(s => <span key={s.id} className="rounded-full bg-[var(--marca-suave)] px-3 py-1.5 text-xs font-semibold text-[var(--marca-oscuro)]">{nombreCategoria(s.nombre)}</span>)}</div>
                  {subsecciones.filter(s => s.productos.length).map(s => <div key={s.id} className="mb-7">
                    <h4 className="mb-4 text-lg font-bold text-[var(--marca-oscuro)]">{nombreCategoria(s.nombre)}</h4>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {s.productos.map(producto => <Tarjeta key={producto._id} producto={producto} whatsapp={whatsapp}/>)}
                    </div>
                  </div>)}
                  <h4 className="mb-2 text-lg font-bold">Ejemplos para tu proyecto</h4>
                  <p className="mb-4 text-sm text-[var(--marca-texto)]">Referencias ilustrativas. Consulta modelos, precios y disponibilidad.</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ejemplos[id].map(([titulo, detalle]) => (
                      <article key={titulo} className="flex flex-col gap-3 rounded-2xl border border-[var(--marca-linea)] bg-[var(--marca-fondo)] p-5">
                        <h5 className="text-lg font-bold">{titulo}</h5>
                        <p className="text-sm text-[var(--marca-texto)]">{detalle}</p>
                        <a className="mt-auto text-sm font-bold text-[var(--marca-acento)] hover:underline" href={whatsappUrl(whatsapp, `Hola, me interesa consultar por: ${titulo}.`)} target="_blank" rel="noreferrer">Consultar por WhatsApp <ArrowUpRight className="inline" size={15} aria-hidden="true"/></a>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
      </div>
    </section>
    </PortadaProvidencia>
  );
}
