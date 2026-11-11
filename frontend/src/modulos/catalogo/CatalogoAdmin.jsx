import { useEffect, useState } from "react";
import { catalogoAdmin, categorias, apartadosCatalogo, nombreCategoria, enlaceCatalogo, estados, moneda, unidades } from "./catalogoService";

const nuevo = { nombre: "", categoria: categorias[0], medidas: "", caracteristicas: "", precio: "", unidad: unidades[0], estado: estados[0], imagenes: [] };
const tiposImagen = ["image/jpeg", "image/png", "image/webp"];
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
  const [config, setConfig] = useState(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [errorFoto, setErrorFoto] = useState("");
  const [aviso, setAviso] = useState("");
  const enlace = enlaceCatalogo();

  useEffect(() => {
    let activo = true;
    Promise.all([catalogoAdmin("/productos"), catalogoAdmin("/configuracion")])
      .then(([lista, acceso]) => {
        if (!activo) return;
        setProductos(lista.productos);
        setConfig(acceso);
        setWhatsapp(acceso.whatsapp);
      })
      .catch((e) => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, []);

  function campo(nombre) {
    return { className: "app-field", value: form[nombre], onChange: (e) => setForm({ ...form, [nombre]: e.target.value }) };
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

  function guardarConfiguracion(e) {
    e.preventDefault();
    ejecutar(async () => {
      setConfig(await catalogoAdmin("/configuracion", "PUT", { whatsapp }));
      setAviso("WhatsApp del catálogo actualizado.");
    });
  }

  function agregarFotos(e) {
    const archivos = Array.from(e.target.files);
    e.target.value = "";
    if (!archivos.length) return;
    setErrorFoto("");
    if (form.imagenes.length + archivos.length > 3) {
      setErrorFoto("Puedes agregar hasta 3 fotos por producto.");
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
      <header className="rounded-3xl bg-[#123e83] p-7 text-white">
        <p className="text-sm font-medium text-blue-100">Administración</p>
        <h1 className="mt-1 text-3xl font-black">Catálogo para clientes</h1>
        <p className="mt-2 text-blue-50">Publica productos y comparte el enlace con tus clientes.</p>
      </header>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
      {aviso && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{aviso}</p>}
      <form onSubmit={guardarConfiguracion} className="app-panel space-y-4 p-5">
        <h2 className="text-xl font-bold">Enlace y cotizaciones</h2>
        <Campo titulo="Enlace para clientes"><input readOnly className="app-field" value={enlace} onFocus={(e) => e.target.select()} /></Campo>
        <Campo titulo="WhatsApp para cotizaciones (opcional)">
          <input className="app-field" inputMode="tel" placeholder="52 seguido del número" maxLength={15} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </Campo>
        <div className="flex flex-wrap items-center gap-4">
          <button className="app-primary rounded-xl px-4 py-2 font-bold disabled:opacity-50" disabled={!config || ocupado}>Guardar WhatsApp</button>
          <a className="text-sm font-bold text-blue-800 underline" href={enlace} target="_blank" rel="noreferrer">Abrir vista del cliente</a>
        </div>
      </form>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <form className="app-panel space-y-4 p-5" onSubmit={guardarProducto}>
          <h2 className="text-xl font-bold">{form._id ? "Editar producto" : "Nuevo producto"}</h2>
          <fieldset disabled={ocupado || !config} className="space-y-4 disabled:opacity-70">
            <Campo titulo="Nombre"><input {...campo("nombre")} required maxLength={100} /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo titulo="Sección del catálogo"><select {...campo("categoria")}>{apartadosCatalogo.map(apartado => <optgroup key={apartado.id} label={apartado.nombre}>{apartado.categorias.map(valor => <option key={valor} value={valor}>{nombreCategoria(valor)}</option>)}</optgroup>)}</select></Campo>
              <Campo titulo="Estado"><select {...campo("estado")}>{estados.map((valor) => <option key={valor}>{valor}</option>)}</select></Campo>
              <Campo titulo="Precio (MXN)"><input {...campo("precio")} type="number" min="0" max="10000000" step="0.01" required /></Campo>
              <Campo titulo="Unidad"><select {...campo("unidad")}>{unidades.map((valor) => <option key={valor}>{valor}</option>)}</select></Campo>
            </div>
            <Campo titulo="Medidas"><input {...campo("medidas")} maxLength={120} placeholder="Ej. 1.20 × 0.60 m" /></Campo>
            <Campo titulo="Características"><textarea {...campo("caracteristicas")} rows={3} maxLength={1500} /></Campo>
            <Campo titulo={`Fotos · ${form.imagenes.length} de 3`}><input className="app-field" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={agregarFotos} /></Campo>
            <p className="text-xs text-slate-600">Las fotos grandes se ajustan automáticamente. Guarda el producto para conservarlas.</p>
            {errorFoto && <p role="alert" className="text-sm text-rose-700">{errorFoto}</p>}
            <div className="flex flex-wrap gap-3">
              {form.imagenes.map((imagen, i) => (
                <div key={i} className="space-y-1">
                  <img src={imagen} alt={`Foto ${i + 1} del producto`} className="h-16 w-20 rounded-lg object-cover" />
                  <button type="button" className="text-xs font-semibold text-rose-800" aria-label={`Quitar foto ${i + 1}`} onClick={() => setForm({ ...form, imagenes: form.imagenes.filter((_, indice) => indice !== i) })}>Quitar</button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="app-primary rounded-xl px-4 py-2 font-bold">{form.estado === "publicado" ? "Guardar y publicar" : form.estado === "oculto" ? "Guardar como oculto" : "Guardar borrador"}</button>
              {form._id && <button type="button" className="text-sm font-bold text-blue-800" onClick={() => { setForm(nuevo); setErrorFoto(""); }}>Cancelar edición</button>}
            </div>
          </fieldset>
        </form>
        <section className="app-panel p-5">
          <h2 className="text-xl font-bold">Productos registrados</h2>
          {!productos.length && <p className="mt-3 text-sm text-slate-600">{config ? "Todavía no hay productos." : "Cargando productos…"}</p>}
          <ul className="divide-y divide-slate-100">
            {productos.map((producto) => (
              <li key={producto._id} className="flex items-center gap-3 py-4">
                {producto.imagenes[0] && <img src={producto.imagenes[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{producto.nombre}</p>
                  <p className="text-sm text-slate-600">{producto.categoria} · {moneda.format(producto.precio)} / {producto.unidad} · {producto.estado}</p>
                </div>
                <button type="button" disabled={ocupado} className="text-sm font-bold text-blue-800" onClick={() => { setForm(producto); setErrorFoto(""); }}>Editar</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
