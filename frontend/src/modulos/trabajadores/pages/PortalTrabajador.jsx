import { useEffect, useState } from "react";
import { Bell, BriefcaseBusiness, CalendarDays, ClipboardList, Clock, KeyRound, LogOut, MapPin, UserRound } from "lucide-react";
import BrandMark from "../../../components/BrandMark";
import { solicitarApi } from "../../../services/api";
import SeccionAsistencias from "../../asistencias/pages/SeccionAsistencias";

import MisAsistencias from "../../asistencias/pages/MisAsistencias";

const secciones = [
  { id: "trabajos", titulo: "Mis trabajos", corto: "Trabajos", icono: BriefcaseBusiness },
  { id: "asistencia", titulo: "Registrar asistencia", corto: "Checar", icono: Clock },
  { id: "historial", titulo: "Mis asistencias", corto: "Historial", icono: CalendarDays },
  { id: "tareas", titulo: "Mis tareas", corto: "Tareas", icono: ClipboardList },
  { id: "gavetas", titulo: "Mis gavetas", corto: "Gavetas", icono: MapPin },
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
  const [panel, setPanel] = useState("");
  const trabajador = usuario.trabajador;

  useEffect(() => {
    if (!trabajador) return;
    const controller = new AbortController();
    const cargar = () => solicitarApi("/api/mi-trabajo", { cache: "no-store", signal: controller.signal })
      .then((datos) => { if (!controller.signal.aborted) { setAsignaciones(datos); setError(""); } })
      .catch((e) => { if (!controller.signal.aborted) setError(e.message); });
    cargar();
    const actualizar = () => cargar();
    const intervalo = setInterval(actualizar, 60000);
    window.addEventListener("focus", actualizar);
    return () => {
      controller.abort();
      clearInterval(intervalo);
      window.removeEventListener("focus", actualizar);
    };
  }, [trabajador]);

  const actual = secciones.find(({ id }) => id === seccion);
  const elementos = asignaciones?.[seccion] ?? [];

  const tareas = asignaciones?.tareas ?? [];
  const pendientes = tareas.filter(tarea => tarea.estado !== "finalizada");
  function navegar(destino) {
    setPanel("");
    setSeccion(destino);
    window.scrollTo({ top: 0 });
  }

  return (
    <main className="acciones-moviles app-background min-h-screen min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="relative z-20 bg-gradient-to-br from-[#f5444b] via-[#a33d63] to-[#554372] px-4 py-5 text-white sm:py-7">
        <div className="mx-auto grid max-w-6xl justify-items-center gap-4">
          <BrandMark />
          <div className="relative flex justify-center gap-3" onKeyDown={evento => { if (evento.key === "Escape") setPanel(""); }}>
            <button type="button" aria-label="Mi cuenta" aria-expanded={panel === "cuenta"} onClick={() => setPanel(panel === "cuenta" ? "" : "cuenta")}
              className="grid size-11 place-items-center rounded-full border border-white/50 bg-white/10 hover:bg-white/20"><UserRound size={21} aria-hidden="true" /></button>
            <button type="button" aria-label={`Notificaciones, ${pendientes.length} tareas pendientes`} aria-expanded={panel === "avisos"}
              onClick={() => setPanel(panel === "avisos" ? "" : "avisos")}
              className="relative grid size-11 place-items-center rounded-full border border-white/50 bg-white/10 hover:bg-white/20">
              <Bell size={20} aria-hidden="true" />
              {pendientes.length > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 text-xs font-bold text-[#852e56]">{pendientes.length}</span>}
            </button>
            {panel && <div className="absolute left-1/2 top-full mt-3 w-[min(18rem,85vw)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-xl">
              {panel === "cuenta" ? <>
                <p className="break-all px-3 py-2 text-sm font-semibold">{usuario.usuario || usuario.email}</p>
                <button type="button" onClick={alCambiarContrasena} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm hover:bg-slate-100"><KeyRound size={16} /> Cambiar contraseña</button>
                <button type="button" onClick={alSalir} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm text-rose-700 hover:bg-rose-50"><LogOut size={16} /> Salir</button>
              </> : <>
                <h2 className="px-3 py-2 font-bold">Tareas pendientes</h2>
                {error ? <p className="px-3 text-sm text-rose-700">{error}</p> : !asignaciones && trabajador ? <p className="px-3 text-sm">Consultando tareas…</p> :
                  pendientes.length ? <ul className="max-h-56 overflow-y-auto">{pendientes.map(tarea => (
                    <li key={tarea._id}><button type="button" onClick={() => navegar("tareas")} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100">{tarea.titulo}</button></li>
                  ))}</ul> : <p className="px-3 pb-2 text-sm text-slate-600">No tienes tareas pendientes.</p>}
              </>}
            </div>}
          </div>
        </div>
      </header>
      {!trabajador ? (
        <p role="status" className="mx-auto max-w-3xl p-6">Tu cuenta todavía no está vinculada a una ficha. Pide al administrador que habilite el acceso desde Trabajadores.</p>
      ) : (
        <>
          <nav aria-label="Portal del trabajador" className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-6xl grid-cols-5 gap-1 border-t border-slate-200 bg-white/95 px-1 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur md:static md:gap-2 md:border-0 md:bg-transparent md:px-5 md:pt-5 md:shadow-none">
            {secciones.map(({ id, titulo, corto, icono: Icono }) => (
              <button key={id} type="button" aria-current={id === seccion ? "page" : undefined} onClick={() => navegar(id)}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-bold md:flex-row md:gap-2 md:text-sm ${id === seccion ? "bg-[#124B91] text-white" : "bg-white text-[#124B91] hover:bg-blue-50"}`}>
                <Icono size={18} aria-hidden="true"/> <span className="md:hidden">{corto}</span><span className="hidden md:inline">{titulo}</span>
              </button>
            ))}
          </nav>
          {seccion === "asistencia" ? <SeccionAsistencias miTrabajador={trabajador}/> : seccion === "historial" ? <MisAsistencias /> : (
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
