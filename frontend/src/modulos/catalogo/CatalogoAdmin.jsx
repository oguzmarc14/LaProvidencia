import { prepararFoto } from "../../services/prepararFoto";
import AlertaModal from "../../components/ui/AlertaModal";
import { avisar } from "../../services/avisos";
import { useState } from "react";
import { Copy, ImagePlus, X } from "lucide-react";
import { catalogoAdmin, categorias, apartadosCatalogo, nombreCategoria, enlaceCatalogo, unidades } from "./catalogoService";

const nuevo = { nombre: "", categoria: categorias[0], medidas: "", material: "", presentacion: "", acabados: "", caracteristicas: "", precio: "", unidad: unidades[0], imagenes: [] };
const normalizarCategoria = texto => texto.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const maxFotos = 8;

function Campo({ titulo, children }) {
  return <label className="block"><span className="app-label">{titulo}</span>{children}</label>;
}

function SelectorCategoria({ valor, cambiar }) {
  const [consulta, setConsulta] = useState("");
  const [abierto, setAbierto] = useState(false);
  const grupos = apartadosCatalogo.map(grupo => ({
    ...grupo,
    categorias: grupo.categorias.filter(categoria =>
      normalizarCategoria(grupo.nombre + " " + nombreCategoria(categoria)).includes(normalizarCategoria(consulta))),
  })).filter(grupo => grupo.categorias.length);

  function cerrar() {
    setAbierto(false);
    setConsulta("");
  }

  return <div className="relative" onBlur={evento => {
    if (!evento.currentTarget.contains(evento.relatedTarget)) cerrar();
  }} onKeyDown={evento => { if (evento.key === "Escape") cerrar(); }}>
    <label className="app-label" htmlFor="categoria-producto">Categoría</label>
    <input id="categoria-producto" className="app-field" autoComplete="off"
      aria-expanded={abierto} aria-controls="opciones-categoria"
      placeholder={nombreCategoria(valor) || "Busca una categoría"}
      value={abierto ? consulta : nombreCategoria(valor)}
      onFocus={() => setAbierto(true)} onClick={() => setAbierto(true)}
      onChange={evento => { setAbierto(true); setConsulta(evento.target.value); }}
      onKeyDown={evento => {
        if (evento.key !== "Enter") return;
        evento.preventDefault();
        const opciones = grupos.flatMap(grupo => grupo.categorias);
        if (abierto && opciones.length === 1) { cambiar(opciones[0]); cerrar(); }
      }} />
    <div id="opciones-categoria" hidden={!abierto} className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
      {!grupos.length && <p role="status" className="p-3 text-sm text-slate-600">No hay coincidencias.</p>}
      {grupos.map(grupo => <div key={grupo.id} role="group" aria-label={grupo.nombre}>
        <p className="px-3 pt-2 text-xs font-bold text-slate-500">{grupo.nombre}</p>
        {grupo.categorias.map(categoria => <button key={categoria} type="button"
          aria-pressed={valor === categoria} onClick={() => { cambiar(categoria); cerrar(); }}
          className={`block min-h-11 w-full rounded-lg px-3 text-left text-sm hover:bg-blue-50 ${valor === categoria ? "bg-blue-100 font-bold text-blue-900" : "text-slate-800"}`}>
          {nombreCategoria(categoria)}
        </button>)}
      </div>)}
    </div>
  </div>;
}

export default function CatalogoAdmin({ productoInicial, verProductos }) {
  const [form, setForm] = useState(productoInicial ?? nuevo);
  const [confirmacion, setConfirmacion] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [errorFoto, setErrorFoto] = useState("");
  const [aviso, setAviso] = useState("");

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
      const mensaje = `Puedes agregar hasta ${maxFotos} fotos por producto.`;
      setErrorFoto(mensaje);
      avisar("error", "Límite de fotos", mensaje);
      return;
    }
    setOcupado(true);
    Promise.all(archivos.map(prepararFoto))
      .then((imagenes) => setForm((anterior) => ({ ...anterior, imagenes: [...anterior.imagenes, ...imagenes] })))
      .catch((e) => { setErrorFoto(e.message); avisar("error", "No se pudieron agregar las fotos", e.message); })
      .finally(() => setOcupado(false));
  }

  function guardarProducto(e) {
    e.preventDefault();
    setConfirmacion({
      tipo: "confirm", titulo: form._id ? "¿Guardar cambios?" : "¿Crear producto?",
      mensaje: `«${form.nombre}» será visible en el catálogo público.`,
      confirmarTexto: "Publicar producto",
    });
  }

  function confirmarGuardado() {
    setConfirmacion(null);
    ejecutar(async () => {
      const { _id, ...datos } = form;
      const { producto } = await catalogoAdmin(_id ? `/productos/${_id}` : "/productos", _id ? "PUT" : "POST", { ...datos, precio: Number(datos.precio), estado: "publicado", precioDesde: false });
      setForm(nuevo);
      setErrorFoto("");
      const fotos = producto.imagenes.length;

      setAviso(`Producto guardado con ${fotos} ${fotos === 1 ? "foto" : "fotos"}. Visible para clientes.`);
    });
  }

  return (
    <section className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <div className="flex justify-center sm:justify-end">
        <button type="button" onClick={copiarCatalogo} className="accion-ancho-movil app-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto rounded-xl px-4 py-3 text-sm font-bold">
          <Copy size={17} aria-hidden="true" /> Copiar catálogo
        </button>
      </div>
      {error && <p role="alert" className="break-words rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
      {aviso && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{aviso}</p>}
      <form className="app-panel scroll-mt-24 p-5 sm:p-8" onSubmit={guardarProducto}>
        <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">{form._id ? "Editar producto" : "Nuevo producto"}</h1>
        <fieldset disabled={ocupado} className="grid min-w-0 gap-7 disabled:opacity-70 lg:grid-cols-[minmax(0,1fr)_minmax(0,.75fr)]">
          <div className="min-w-0 space-y-5">
            <h2 className="text-lg font-bold">Datos del producto</h2>
            <Campo titulo="Nombre"><input {...campo("nombre")} required maxLength={100} placeholder="Ej. Cubierta de granito negro" /></Campo>
            <SelectorCategoria valor={form.categoria} cambiar={categoria => setForm(actual => ({ ...actual, categoria }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo titulo="Precio (MXN)"><input {...campo("precio")} type="number" min="0" max="10000000" step="0.01" placeholder="0.00" required /></Campo>
              <Campo titulo="Unidad"><select {...campo("unidad")}>{unidades.map(valor => <option key={valor}>{valor}</option>)}</select></Campo>
            </div>
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

            <p className="text-sm text-slate-600">Agrega al menos una foto para publicar.</p>
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap border-t border-slate-200 pt-5 lg:col-span-2">
            <button className="accion-ancho-movil app-primary rounded-xl px-5 py-3 font-bold" disabled={!form.imagenes.length}>
              {ocupado ? "Procesando…" : "Publicar producto"}
            </button>
            {form._id && <button type="button" className="accion-ancho-movil rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-blue-800" onClick={verProductos}>Cancelar edición</button>}
          </div>
        </fieldset>
      </form>
      <AlertaModal alerta={confirmacion} onCerrar={() => setConfirmacion(null)} onConfirmar={confirmarGuardado} />
    </section>
  );
}
