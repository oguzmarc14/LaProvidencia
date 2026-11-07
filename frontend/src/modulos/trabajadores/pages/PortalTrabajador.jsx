import { useEffect, useState } from "react";
import { BriefcaseBusiness, ClipboardList, Clock, KeyRound, LogOut, MapPin } from "lucide-react";
import BrandMark from "../../../components/BrandMark";
import { solicitarApi } from "../../../services/api";
import SeccionAsistencias from "../../asistencias/pages/SeccionAsistencias";

const secciones = [
  { id: "trabajos", titulo: "Mis trabajos", icono: BriefcaseBusiness },
  { id: "asistencia", titulo: "Mi asistencia", icono: Clock },
  { id: "tareas", titulo: "Mis tareas", icono: ClipboardList },
  { id: "gavetas", titulo: "Mis gavetas", icono: MapPin },
];

const formatoFecha = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" });
const fecha = (valor) => valor ? formatoFecha.format(new Date(valor)) : "Sin fecha";
const estado = (valor) => valor?.replaceAll("_", " ");

function DetalleAsignacion({ seccion, item }) {
  if (seccion === "gavetas") {
    return <>
      <h3 className="text-lg font-bold">Gaveta {item.gaveta}</h3>
      <p>{[item.localidad, item.pasillo && "Pasillo " + item.pasillo].filter(Boolean).join(" · ")}</p>
      <p>{[item.modeloLapida, item.materialLapida].filter(Boolean).join(" · ")}</p>
      <p>Entrega: {fecha(item.fechaEntrega)}</p>
    </>;
  }
  if (seccion === "tareas") {
    return <>
      <h3 className="text-lg font-bold">{item.titulo}</h3>
      <p className="whitespace-pre-wrap">{item.descripcion}</p>
      <p>Inicio: {fecha(item.fechaInicio)} · Límite: {fecha(item.fechaLimite)}</p>
      <p>Prioridad {item.prioridad} · {estado(item.estado)} · {item.progreso ?? 0}%</p>
    </>;
  }
  return <>
    <h3 className="text-lg font-bold">{item.nombre}</h3>
    <p>{item.material} · {estado(item.estado)}</p>
    {item.medidas && <p>Medidas: {item.medidas}</p>}
    {item.piezasTotales && <p>Piezas: {item.piezasTotales}</p>}
    {item.especificaciones && <p className="whitespace-pre-wrap">{item.especificaciones}</p>}
    {item.direccionInstalacion && <p>Instalación: {item.direccionInstalacion}</p>}
    <p>Inicio: {fecha(item.fechaInicio)} · Entrega: {fecha(item.fechaFinal)}</p>
  </>;
}

export default function PortalTrabajador({ usuario, alSalir, alCambiarContrasena }) {
  const [seccion, setSeccion] = useState("trabajos");
  const [asignaciones, setAsignaciones] = useState(null);
  const [error, setError] = useState("");
  const trabajador = usuario.trabajador;

  useEffect(() => {
    if (!trabajador) return;
    const controller = new AbortController();
    solicitarApi("/api/mi-trabajo", { cache: "no-store", signal: controller.signal })
      .then((datos) => { if (!controller.signal.aborted) setAsignaciones(datos); })
      .catch((e) => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [trabajador]);

  const actual = secciones.find(({ id }) => id === seccion);
  const elementos = asignaciones?.[seccion] ?? [];

  return (
    <main className="app-background min-h-screen">
      <header className="bg-[#123e83] px-5 py-5 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <BrandMark/>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={alCambiarContrasena} className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-3 py-2 text-sm font-semibold hover:bg-white/10">
              <KeyRound size={16}/> Cambiar contraseña
            </button>
            <button type="button" onClick={alSalir} className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-3 py-2 text-sm font-semibold hover:bg-white/10">
              <LogOut size={16}/> Salir
            </button>
          </div>
        </div>
      </header>
      {!trabajador ? (
        <p role="status" className="mx-auto max-w-3xl p-6">Tu cuenta todavía no está vinculada a una ficha. Pide al administrador que habilite el acceso desde Trabajadores.</p>
      ) : (
        <>
          <nav aria-label="Portal del trabajador" className="mx-auto grid max-w-6xl grid-cols-2 gap-2 px-5 pt-5 sm:grid-cols-4">
            {secciones.map(({ id, titulo, icono: Icono }) => (
              <button key={id} type="button" aria-current={id === seccion ? "page" : undefined} onClick={() => setSeccion(id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${id === seccion ? "bg-[#124B91] text-white" : "bg-white text-[#124B91] hover:bg-blue-50"}`}>
                <Icono size={18} aria-hidden="true"/> {titulo}
              </button>
            ))}
          </nav>
          {seccion === "asistencia" ? <SeccionAsistencias miTrabajador={trabajador}/> : (
            <section className="mx-auto max-w-6xl p-5 pb-12">
              <h2 className="mb-4 text-2xl font-bold text-[#203d6b]">{actual.titulo}</h2>
              {error ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p> :
                !asignaciones ? <p role="status">Consultando asignaciones...</p> :
                !elementos.length ? <p className="app-panel p-5">Aún no hay asignaciones en esta sección.</p> :
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {elementos.map((item) => (
                    <article key={item._id} className="app-panel space-y-2 p-5 text-sm text-slate-700">
                      <DetalleAsignacion seccion={seccion} item={item}/>
                    </article>
                  ))}
                </div>}
            </section>
          )}
        </>
      )}
    </main>
  );
}
