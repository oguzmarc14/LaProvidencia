import { solicitarApi } from "../../services/api";
import { avisar } from "../../services/avisos";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { obtenerTrabajos } from "../trabajos/services/trabajosService";
import { obtenerTareas } from "../tareas/services/tareasService";
import { obtenerRegistrosVenta } from "../dashboard/services/registroVentasService";

const tipos = {
  tareas: { nombre: "Tareas", color: "bg-violet-100 text-violet-900", activo: "bg-violet-800 text-white", punto: "bg-violet-600", cargar: obtenerTareas },
  trabajos: { nombre: "Trabajos", color: "bg-blue-100 text-blue-900", activo: "bg-blue-800 text-white", punto: "bg-blue-600", cargar: obtenerTrabajos },
  ventas: { nombre: "Lápidas", color: "bg-emerald-100 text-emerald-900", activo: "bg-emerald-800 text-white", punto: "bg-emerald-600", cargar: obtenerRegistrosVenta },
};
const hoy = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
const iso = fecha => fecha.toISOString().slice(0, 10);
const mesDe = fecha => new Date(fecha.slice(0, 7) + "-01T00:00:00Z");
const formatoMes = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" });
const formatoDia = new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeZone: "UTC" });
const semana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function actividades(tipo, registros) {
  return registros.flatMap(item => {
    const nombre = item.titulo || item.nombre || item.modeloLapida;
    const fechas = tipo === "tareas" ? [["Inicio", item.fechaInicio], ["Vence", item.fechaLimite]]
      : tipo === "trabajos" ? [["Inicio", item.fechaInicio], ["Entrega", item.fechaFinal]]
      : [["Registro", item.fechaVenta], ["Entrega", item.fechaEntrega]];
    return fechas.filter(([, valor]) => valor).map(([accion, valor]) => ({
      id: tipo + item._id + accion, tipo, nombre, accion, fecha: valor.slice(0, 10),
    }));
  });
}

function BarrasTareas({ mes, primerDia, totalDias, tareas, navegar }) {
  const primero = mes.getTime();
  const diaMs = 86400000;
  const finMes = primero + (totalDias - 1) * diaMs;
  const periodos = tareas.flatMap(tarea => {
    const inicio = Date.parse(tarea.fechaInicio?.slice(0, 10));
    const fin = Date.parse(tarea.fechaLimite?.slice(0, 10));
    return inicio <= finMes && fin >= primero && inicio <= fin ? [{ tarea, inicio, fin }] : [];
  });

  if (!periodos.length) return <p className="py-6 text-center text-sm text-slate-600">No hay tareas programadas para este mes.</p>;

  return <div className="overflow-x-auto pb-2" role="region" aria-label="Cronograma de tareas" tabIndex={0}>
    <div className="min-w-[560px] space-y-2">
      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500">
        {semana.map(dia => <span key={dia} className="py-2">{dia}</span>)}
      </div>
      {Array.from({ length: Math.ceil((primerDia + totalDias) / 7) }, (_, fila) => {
        const inicioSemana = primero + (fila * 7 - primerDia) * diaMs;
        const finSemana = inicioSemana + 6 * diaMs;
        return <div key={inicioSemana} className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <div className="grid grid-cols-7 text-center text-sm font-bold text-slate-600">
            {Array.from({ length: 7 }, (_, columna) => {
              const dia = inicioSemana + columna * diaMs;
              return <span key={dia} className="py-2">{dia >= primero && dia <= finMes ? new Date(dia).getUTCDate() : ""}</span>;
            })}
          </div>
          {periodos.map(({ tarea, inicio, fin }) => {
            const desde = Math.max(inicio, inicioSemana, primero);
            const hasta = Math.min(fin, finSemana, finMes);
            if (desde > hasta) return null;
            const columna = (desde - inicioSemana) / diaMs + 1;
            const ancho = (hasta - desde) / diaMs + 1;
            const etiqueta = `${tarea.titulo} · ${formatoDia.format(inicio)} al ${formatoDia.format(fin)}`;
            return <div key={tarea._id} className="grid grid-cols-7">
              <button type="button" style={{ gridColumn: `${columna} / span ${ancho}` }}
                aria-label={etiqueta} title={etiqueta} onClick={() => navegar("tareas")}
                className="min-h-11 min-w-0 truncate rounded-lg bg-violet-100 px-2 text-left text-xs font-bold text-violet-900 hover:bg-violet-200">
                {inicio < desde && "← "}{tarea.titulo}{fin > hasta && " →"}
              </button>
            </div>;
          })}
        </div>;
      })}
    </div>
  </div>;
}

export default function CalendarioAdmin({ navegar }) {
  const [festivos, setFestivos] = useState([]);
  const [nombreFestivo, setNombreFestivo] = useState("");
  const [guardandoFestivo, setGuardandoFestivo] = useState(false);
  const [errorFestivos, setErrorFestivos] = useState("");
  const [vista, setVista] = useState("calendario");
  const [seleccion, setSeleccion] = useState(hoy);
  const [filtro, setFiltro] = useState("");
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let activo = true;
    Promise.allSettled(Object.values(tipos).map(({ cargar }) => cargar())).then(respuestas => {
      if (!activo) return;
      const eventos = [];
      const errores = [];
      Object.keys(tipos).forEach((tipo, i) => {
        const respuesta = respuestas[i];
        if (respuesta.status === "fulfilled") eventos.push(...actividades(tipo, respuesta.value[tipo] || []));
        else errores.push(tipos[tipo].nombre);
      });
      setResultado({ eventos, errores, tareas: respuestas[0].value?.tareas || [] });
    });
    return () => { activo = false; };
  }, [intento]);

  useEffect(() => {
    const controller = new AbortController();
    setErrorFestivos("");
    solicitarApi("/api/calendario/festivos", { signal: controller.signal })
      .then(datos => { if (!controller.signal.aborted) setFestivos(datos.festivos); })
      .catch(error => { if (!controller.signal.aborted) setErrorFestivos(error.message); });
    return () => controller.abort();
  }, [intento]);

  async function guardarFestivo(evento) {
    evento.preventDefault();
    if (guardandoFestivo || !nombreFestivo.trim()) return;
    setGuardandoFestivo(true);
    const fecha = seleccion;
    try {
      const { festivo } = await solicitarApi(`/api/calendario/festivos/${fecha}`, {
        method: "PUT", body: JSON.stringify({ nombre: nombreFestivo.trim() }),
      });
      setFestivos(actuales => [...actuales.filter(item => item._id !== fecha), festivo]);
      setNombreFestivo("");
      avisar("success", "Festivo guardado", festivo.nombre);
    } catch (error) {
      avisar("error", "No se pudo guardar el festivo", error.message);
    } finally {
      setGuardandoFestivo(false);
    }
  }

  useEffect(() => { setNombreFestivo(""); }, [seleccion]);
  const mes = mesDe(seleccion);
  const primerDia = (mes.getUTCDay() + 6) % 7;
  const totalDias = new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth() + 1, 0)).getUTCDate();
  const porDia = new Map();
  for (const evento of resultado?.eventos || []) {
    if (filtro && evento.tipo !== filtro) continue;
    if (!porDia.has(evento.fecha)) porDia.set(evento.fecha, []);
    porDia.get(evento.fecha).push(evento);
  }

  function moverMes(delta) {
    const siguiente = new Date(mes);
    siguiente.setUTCMonth(siguiente.getUTCMonth() + delta);
    setSeleccion(iso(siguiente));
  }

  return <section className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6">
    <header className="rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white shadow-lg sm:p-9">
      <CalendarDays size={26} aria-hidden="true" />
      <h1 className="mt-3 text-3xl font-black">Calendario de actividades</h1>
      <p className="mt-2 text-sm text-white/85">Consulta inicios, vencimientos y entregas del equipo.</p>
    </header>
    <div className="app-panel min-w-0 space-y-4 p-3 sm:p-6">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <button type="button" aria-label="Mes anterior" onClick={() => moverMes(-1)} className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-900"><ChevronLeft aria-hidden="true" /></button>
        <h2 className="text-center font-extrabold capitalize text-[#203d6b]" aria-live="polite">{formatoMes.format(mes)}</h2>
        <button type="button" aria-label="Mes siguiente" onClick={() => moverMes(1)} className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-900"><ChevronRight aria-hidden="true" /></button>
      </div>
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setSeleccion(hoy())} className="min-h-11 rounded-xl border border-blue-200 px-4 text-sm font-bold text-blue-900">Hoy</button>
        <button type="button" disabled={!resultado} onClick={() => { setResultado(null); setIntento(i => i + 1); }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 text-sm font-bold text-blue-900 disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" /> Actualizar</button>
      </div>
      <div role="group" aria-label="Vista del calendario" className="mx-auto grid w-full max-w-sm grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
        {[["calendario", "Ver calendario"], ["trabajos", "Ver trabajos"]].map(([id, texto]) => (
          <button key={id} type="button" aria-pressed={vista === id} onClick={() => setVista(id)}
            className={`min-h-11 rounded-xl px-2 text-sm font-bold ${vista === id ? "app-primary" : "text-slate-700 hover:bg-white"}`}>{texto}</button>
        ))}
      </div>
      {vista === "trabajos" ? (
        !resultado ? <p role="status">Cargando tareas…</p> :
          resultado.errores.includes("Tareas") ? <p role="alert">No se pudieron cargar las tareas. Pulsa Actualizar para reintentar.</p> :
            <BarrasTareas mes={mes} primerDia={primerDia} totalDias={totalDias} tareas={resultado.tareas} navegar={navegar} />
      ) : <>
      <div role="group" aria-label="Tipo de actividad" className="flex flex-wrap justify-center gap-2">
        {["", ...Object.keys(tipos)].map(tipo => <button key={tipo} type="button" aria-pressed={filtro === tipo} onClick={() => setFiltro(tipo)}
          className={`min-h-11 rounded-full px-3 text-sm font-bold ${filtro === tipo ? (tipos[tipo]?.activo || "bg-[#123e83] text-white") : tipos[tipo]?.color || "bg-slate-100 text-slate-800"}`}>
          {tipos[tipo]?.nombre || "Todas"}
        </button>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {semana.map(dia => <span key={dia} className="py-2 text-xs font-bold text-slate-500">{dia}</span>)}
        {Array.from({ length: primerDia }, (_, i) => <span key={i} aria-hidden="true" />)}
        {Array.from({ length: totalDias }, (_, i) => {
          const fecha = iso(new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth(), i + 1)));
          const eventos = porDia.get(fecha) || [];
          const festivo = festivos.find(item => item._id === fecha);
          return <button key={fecha} type="button" aria-pressed={fecha === seleccion} aria-current={fecha === hoy() ? "date" : undefined}
            aria-label={`${formatoDia.format(new Date(fecha))}, ${eventos.length} actividades${festivo ? ", festivo: " + festivo.nombre : ""}`} onClick={() => setSeleccion(fecha)}
            className={`grid min-h-12 place-content-center gap-1 rounded-lg border text-sm font-bold sm:min-h-16 ${fecha === seleccion ? "border-[#123e83] bg-blue-100 text-blue-950" : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-blue-50"}`}>
            {i + 1}
            {festivo && <span className="mx-auto size-2 rounded-full bg-amber-500" aria-hidden="true" />}
            <span className="flex h-2 justify-center gap-0.5" aria-hidden="true">
              {[...new Set(eventos.map(evento => evento.tipo))].map(tipo => <span key={tipo} className={`size-1.5 rounded-full ${tipos[tipo].punto}`} />)}
            </span>
          </button>;
        })}
      </div>
      </>}
    </div>
    <section className="app-panel p-5 sm:p-6" aria-labelledby="festivos-titulo">
      <h2 id="festivos-titulo" className="text-lg font-extrabold text-[#203d6b]">Días festivos</h2>
      <p className="mt-1 text-sm capitalize text-slate-600">{formatoDia.format(new Date(seleccion))}</p>
      {errorFestivos && <p role="alert" className="mt-2 text-sm text-rose-700">{errorFestivos}</p>}
      {festivos.find(item => item._id === seleccion) && <p className="mt-3 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-900">{festivos.find(item => item._id === seleccion).nombre}</p>}
      <form key={seleccion} onSubmit={guardarFestivo} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block text-sm font-bold">Nombre del festivo
          <input className="app-field mt-1" required maxLength={80} value={nombreFestivo}
            onChange={evento => setNombreFestivo(evento.target.value)} placeholder="Ej. Día de la Constitución" />
        </label>
        <button type="submit" disabled={guardandoFestivo} className="app-primary rounded-xl px-5 py-3 font-bold disabled:opacity-50">
          {guardandoFestivo ? "Guardando…" : "Guardar festivo"}
        </button>
      </form>
    </section>
    {vista === "calendario" && <section className="app-panel p-5 sm:p-6" aria-labelledby="agenda-dia">
      <h2 id="agenda-dia" className="font-extrabold capitalize text-[#203d6b]">{formatoDia.format(new Date(seleccion))}</h2>
      {!resultado && <p role="status" className="mt-3 text-sm text-slate-600">Cargando actividades…</p>}
      {resultado?.errores.length > 0 && <p role="alert" className="mt-3 text-sm text-rose-700">Faltan datos de {resultado.errores.join(", ")}. Pulsa Actualizar para reintentar.</p>}
      {resultado && !(porDia.get(seleccion)?.length) && <p className="mt-3 text-sm text-slate-600">No hay actividades cargadas para este día.</p>}
      <ul className="mt-3 space-y-2">
        {porDia.get(seleccion)?.map(evento => <li key={evento.id}>
          <button type="button" onClick={() => navegar(evento.tipo)} className="flex min-h-12 w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm hover:bg-slate-50 sm:justify-start">
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tipos[evento.tipo].color}`}>{tipos[evento.tipo].nombre} · {evento.accion}</span>
            <span className="min-w-0 break-words font-bold">{evento.nombre}</span>
          </button>
        </li>)}
      </ul>
    </section>}
  </section>;
}
