import { useEffect, useRef, useState } from "react";
import { Copy, ImagePlus, Package, X } from "lucide-react";
import { catalogoAdmin, categorias, apartadosCatalogo, nombreCategoria, enlaceCatalogo, estados, moneda, unidades } from "./catalogoService";

const nuevo = { nombre: "", categoria: categorias[0], medidas: "", material: "", presentacion: "", acabados: "", precioDesde: false, caracteristicas: "", precio: "", unidad: unidades[0], estado: estados[0], imagenes: [] };
const tiposImagen = ["image/jpeg", "image/png", "image/webp"];
const maxFotos = 8;
const maxBytes = 400 * 1024;
const leerImagen = (archivo) => new Promise((resolve, reject) => {
  const lector = new FileReader();
  lector.onload = () => resolve(lector.result);
  lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
  lector.readAsDataURL(archivo);
});

async function prepararFoto(archivo) {
  if (!tiposImagen.includes(archivo.type)) {
    throw new Error(`La foto «${archivo.name}» debe ser JPG, PNG o WebP.`);
  }

  let imagen;
  try {
    imagen = await createImageBitmap(archivo);
  } catch {
    throw new Error(`No se pudo abrir la foto «${archivo.name}».`);
  }

  try {
    if (archivo.type === "image/webp" && archivo.size <= maxBytes) return await leerImagen(archivo);
    const lienzo = document.createElement("canvas");
    const contexto = lienzo.getContext("2d");
    if (!contexto) throw new Error("El navegador no pudo preparar la foto.");
    for (const lado of [1600, 1200, 800, 480]) {
      const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height));
      lienzo.width = Math.max(1, Math.round(imagen.width * escala));
      lienzo.height = Math.max(1, Math.round(imagen.height * escala));
      contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      const comprimida = await new Promise((resolve) => lienzo.toBlob(resolve, "image/webp", 0.82));
      if (comprimida?.type !== "image/webp") {
        throw new Error("Este navegador no pudo convertir la foto a WebP.");
      }
      if (comprimida.size <= maxBytes) return await leerImagen(comprimida);
    }
    throw new Error(`No se pudo reducir la foto «${archivo.name}» al tamaño permitido.`);
  } finally {
    imagen.close();
  }
}

function Campo({ titulo, children }) {
  return <label className="block"><span className="app-label">{titulo}</span>{children}</label>;
}

export default function CatalogoAdmin() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(nuevo);
  const [cargando, setCargando] = useState(true);
  const formulario = useRef(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [errorFoto, setErrorFoto] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;
    catalogoAdmin("/productos")
      .then((lista) => {
        if (!activo) return;
        setProductos(lista.productos);
      })
      .catch((e) => { if (activo) setError(e.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  function campo(nombre) {
    return { className: "app-field", value: form[nombre] ?? "", onChange: (e) => setForm({ ...form, [nombre]: e.target.value }) };
  }

  async function ejecutar(accion) {
    setOcupado(true);
    setError("");
    setAviso("");
    try {
      await accion();
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  }

  async function copiarCatalogo() {
    setError("");
    setAviso("");
    try {
      await navigator.clipboard.writeText(enlaceCatalogo);
      setAviso("Enlace del catálogo copiado.");
    } catch {
      setError(`No se pudo copiar automáticamente. Copia este enlace: ${enlaceCatalogo}`);
    }
  }

  function agregarFotos(e) {
    const archivos = Array.from(e.target.files);
    e.target.value = "";
    if (!archivos.length) return;
    setErrorFoto("");
    if (form.imagenes.length + archivos.length > maxFotos) {
      setErrorFoto(`Puedes agregar hasta ${maxFotos} fotos por producto.`);
      return;
    }
    setOcupado(true);
    Promise.all(archivos.map(prepararFoto))
      .then((imagenes) => setForm((anterior) => ({ ...anterior, imagenes: [...anterior.imagenes, ...imagenes] })))
      .catch((e) => setErrorFoto(e.message))
      .finally(() => setOcupado(false));
  }

  function guardarProducto(e) {
    e.preventDefault();
    ejecutar(async () => {
      const { _id, ...datos } = form;
      const { producto } = await catalogoAdmin(_id ? `/productos/${_id}` : "/productos", _id ? "PUT" : "POST", { ...datos, precio: Number(datos.precio) });
      setProductos((anterior) => [producto, ...anterior.filter((item) => item._id !== producto._id)]);
      setForm(nuevo);
      setErrorFoto("");
      const fotos = producto.imagenes.length;
      const visibilidad = producto.estado === "publicado" ? "Visible para clientes." : "Solo visible en administración.";
      setAviso(`Producto guardado con ${fotos} ${fotos === 1 ? "foto" : "fotos"}. ${visibilidad}`);
    });
  }

  return (
    <section className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <div className="flex justify-end">
        <button type="button" onClick={copiarCatalogo} className="app-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold">
          <Copy size={17} aria-hidden="true" /> Copiar catálogo
        </button>
      </div>
      {error && <p role="alert" className="break-words rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
      {aviso && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{aviso}</p>}
      <form ref={formulario} className="app-panel scroll-mt-24 p-5 sm:p-8" onSubmit={guardarProducto}>
        <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">{form._id ? "Editar producto" : "Nuevo producto"}</h1>
        <fieldset disabled={ocupado} className="grid min-w-0 gap-7 disabled:opacity-70 lg:grid-cols-[minmax(0,1fr)_minmax(0,.75fr)]">
          <div className="min-w-0 space-y-5">
            <h2 className="text-lg font-bold">Datos del producto</h2>
            <Campo titulo="Nombre"><input {...campo("nombre")} required maxLength={100} placeholder="Ej. Cubierta de granito negro" /></Campo>
            <Campo titulo="Categoría">
              <select {...campo("categoria")}>{apartadosCatalogo.map(apartado => (
                <optgroup key={apartado.id} label={apartado.nombre}>
                  {apartado.categorias.map(valor => <option key={valor} value={valor}>{nombreCategoria(valor)}</option>)}
                </optgroup>
              ))}</select>
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo titulo="Precio (MXN)"><input {...campo("precio")} type="number" min="0" max="10000000" step="0.01" placeholder="0.00" required /></Campo>
              <Campo titulo="Unidad"><select {...campo("unidad")}>{unidades.map(valor => <option key={valor}>{valor}</option>)}</select></Campo>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.precioDesde ?? false} onChange={e => setForm({ ...form, precioDesde: e.target.checked })} />
              Mostrar el precio como «Desde»
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo titulo="Tipo de material"><input {...campo("material")} maxLength={100} placeholder="Ej. Cuarzo ingenierizado" /></Campo>
              <Campo titulo="Presentación"><input {...campo("presentacion")} maxLength={100} placeholder="Ej. Láminas" /></Campo>
              <Campo titulo="Dimensiones"><input {...campo("medidas")} maxLength={120} placeholder="Ej. 323 × 163 cm" /></Campo>
              <Campo titulo="Acabados"><input {...campo("acabados")} maxLength={200} placeholder="Ej. Pulido, Mate, Satinado" /></Campo>
            </div>
            <Campo titulo="Características"><textarea {...campo("caracteristicas")} rows={4} maxLength={1500} placeholder="Describe el material, el acabado y los detalles del producto." /></Campo>
          </div>
          <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h2 className="text-lg font-bold">Fotos y publicación</h2>
            {form.imagenes[0] ? (
              <img src={form.imagenes[0]} alt="Vista previa de la foto de portada" className="aspect-video w-full rounded-xl bg-white object-contain" />
            ) : (
              <div className="grid aspect-video place-content-center justify-items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
                <ImagePlus size={32} aria-hidden="true" /> Sin foto de portada
              </div>
            )}
            <label className="relative flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-3 py-3 text-center text-sm font-bold text-blue-900 focus-within:ring-2 focus-within:ring-blue-600">
              <ImagePlus size={18} aria-hidden="true" /> Agregar fotos · {form.imagenes.length}/{maxFotos}
              <input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={agregarFotos} disabled={form.imagenes.length >= maxFotos} />
            </label>
            <p className="text-xs text-slate-600">JPG, PNG o WebP. Las fotos nuevas se guardan en WebP.</p>
            {errorFoto && <p role="alert" className="text-sm text-rose-700">{errorFoto}</p>}
            {form.imagenes.length > 0 && <ul className="grid grid-cols-3 gap-2">
              {form.imagenes.map((imagen, i) => (
                <li key={i} className="relative">
                  <img src={imagen} alt={i === 0 ? "Foto de portada" : `Foto ${i + 1} del producto`} className="aspect-square w-full rounded-lg object-cover" />
                  <button type="button" className="absolute right-1 top-1 rounded-full bg-white p-1.5 text-rose-800 shadow" aria-label={`Quitar foto ${i + 1}`} onClick={() => setForm(anterior => ({ ...anterior, imagenes: anterior.imagenes.filter((_, indice) => indice !== i) }))}><X size={16} aria-hidden="true" /></button>
                </li>
              ))}
            </ul>}
            <Campo titulo="Visibilidad"><select {...campo("estado")}>{estados.map(valor => <option key={valor} value={valor}>{valor[0].toUpperCase() + valor.slice(1)}</option>)}</select></Campo>
            <p className="text-sm text-slate-600">{form.estado === "publicado" ? "Visible para clientes. Se requiere al menos una foto." : "Solo visible en el panel administrativo."}</p>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5 lg:col-span-2">
            <button className="app-primary rounded-xl px-5 py-3 font-bold" disabled={form.estado === "publicado" && !form.imagenes.length}>
              {ocupado ? "Procesando…" : form.estado === "publicado" ? "Guardar y publicar" : form.estado === "oculto" ? "Guardar como oculto" : "Guardar borrador"}
            </button>
            {form._id && <button type="button" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-blue-800" onClick={() => { setForm(nuevo); setErrorFoto(""); }}>Cancelar edición</button>}
          </div>
        </fieldset>
      </form>
        <section className="app-panel p-5">
          <h2 className="text-xl font-bold">Productos registrados</h2>
          {!productos.length && <p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><Package size={18} aria-hidden="true" />{cargando ? "Cargando productos…" : "Todavía no hay productos."}</p>}
          <ul className="divide-y divide-slate-100">
            {productos.map((producto) => (
              <li key={producto._id} className="flex items-center gap-3 py-4">
                {producto.imagenes[0] && <img src={producto.imagenes[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{producto.nombre}</p>
                  <p className="text-sm text-slate-600">{producto.categoria} · {moneda.format(producto.precio)} / {producto.unidad} · {producto.estado}</p>
                </div>
                <button type="button" disabled={ocupado} className="text-sm font-bold text-blue-800" onClick={() => { setForm(producto); setErrorFoto(""); formulario.current?.scrollIntoView({ block: "start" }); }}>Editar</button>
              </li>
            ))}
          </ul>
        </section>
    </section>
  );
}
