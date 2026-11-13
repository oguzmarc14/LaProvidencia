import { useEffect, useState } from "react";
import { CalendarDays, Clock, RefreshCw, Search } from "lucide-react";
import { obtenerHistorial } from "../services/asistenciasService";

const zonaMexico = "America/Mexico_City";
const hoy = () => {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaMexico, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const valor = tipo => partes.find(parte => parte.type === tipo).value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
};
const hora = (valor, timeZone) => valor ? new Date(valor).toLocaleTimeString("es-MX", {
  timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit",
}) : "—";
const duracion = registro => {
  if (!registro.salida) return "—";
  const minutos = Math.max(0, Math.floor((new Date(registro.salida) - new Date(registro.llegada)) / 60000));
  return `${Math.floor(minutos / 60)} h ${minutos % 60} min`;
};

export default function AsistenciasAdmin() {
  const [fecha, setFecha] = useState(hoy);
  const [busqueda, setBusqueda] = useState("");
  const [actualizacion, setActualizacion] = useState(0);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setDatos(null);
    setError("");
    setCargando(Boolean(fecha));
    if (fecha) {
      obtenerHistorial(fecha, controller.signal)
        .then(resultado => { if (!controller.signal.aborted) setDatos(resultado); })
        .catch(e => { if (!controller.signal.aborted) setError(e.message); })
        .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    }
    return () => controller.abort();
  }, [fecha, actualizacion]);

  const registros = datos?.asistencias ?? [];
  const filtrados = registros.filter(registro => (registro.trabajador?.nombre || "Trabajador eliminado")
    .toLocaleLowerCase("es-MX").includes(busqueda.trim().toLocaleLowerCase("es-MX")));
  const salidas = registros.filter(registro => registro.salida).length;
  const zonaHoraria = datos?.zonaHoraria || zonaMexico;

  return <section className="mx-auto max-w-7xl p-4 pb-12 sm:p-6 lg:p-10">
    <header className="rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white sm:p-9">
      <Clock size={30} aria-hidden="true"/>
      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/75">La Providencia · Administración</p>
      <h1 className="mt-2 text-3xl font-black">Control de asistencias</h1>
      <p className="mt-3 text-white/90">Consulta las entradas y salidas de los trabajadores por fecha. Horario de México.</p>
    </header>

    <div className="app-panel mt-6 flex flex-wrap items-end gap-4 p-5">
      <label className="min-w-48 flex-1 text-sm font-bold text-slate-700" htmlFor="fecha-asistencias">
        <span className="mb-2 flex items-center gap-2"><CalendarDays size={17}/> Fecha de consulta</span>
        <input id="fecha-asistencias" type="date" className="app-field" value={fecha} onChange={e => setFecha(e.target.value)}/>
      </label>
      <label className="min-w-48 flex-1 text-sm font-bold text-slate-700" htmlFor="buscar-asistencias">
        <span className="mb-2 flex items-center gap-2"><Search size={17}/> Buscar trabajador</span>
        <input id="buscar-asistencias" type="search" className="app-field" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre del trabajador"/>
      </label>
      <button type="button" onClick={() => setFecha(hoy())} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#124B91]">Hoy</button>
      <button type="button" disabled={cargando || !fecha} onClick={() => setActualizacion(valor => valor + 1)} className="app-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50">
        <RefreshCw size={17} className={cargando ? "animate-spin" : ""}/> Actualizar
      </button>
    </div>

    {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    {cargando ? <p role="status" className="mt-6 text-slate-600">Consultando checadas...</p> : datos ? <>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[["Entradas registradas", registros.length], ["Salidas registradas", salidas], ["Sin checar salida", registros.length - salidas]].map(([titulo, total]) =>
          <div key={titulo} className="app-panel p-5"><p className="text-sm font-semibold text-slate-500">{titulo}</p><p className="mt-2 text-3xl font-black text-[#203d6b]">{total}</p></div>)}
      </div>
      <div className="app-panel mt-6 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-bold text-[#203d6b]">Checadas del {new Date(`${datos.fecha}T12:00:00Z`).toLocaleDateString("es-MX", { timeZone: "UTC", dateStyle: "long" })}</h2>
          <p className="mt-1 text-sm text-slate-500">La duración corresponde al tiempo entre entrada y salida.</p>
        </div>
        {filtrados.length ? <div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr>{["Trabajador", "Entrada", "Salida", "Tiempo registrado", "Estado"].map(titulo => <th key={titulo} scope="col" className="px-5 py-4 font-bold">{titulo}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{filtrados.map(registro => <tr key={registro._id}>
            <th scope="row" className="px-5 py-4 font-semibold text-slate-800">{registro.trabajador?.nombre || "Trabajador eliminado"}</th>
            <td className="px-5 py-4"><time dateTime={registro.llegada}>{hora(registro.llegada, zonaHoraria)}</time></td>
            <td className="px-5 py-4">{registro.salida ? <time dateTime={registro.salida}>{hora(registro.salida, zonaHoraria)}</time> : "Pendiente"}</td>
            <td className="px-5 py-4">{duracion(registro)}</td>
            <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${registro.salida ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{registro.salida ? "Entrada y salida" : "Salida pendiente"}</span></td>
          </tr>)}</tbody>
        </table></div> : <p className="p-6 text-slate-500">{busqueda.trim() ? "No hay checadas que coincidan con ese nombre." : "No hay checadas registradas en esta fecha."}</p>}
      </div>
    </> : !error && <p className="mt-6 text-slate-500">Selecciona una fecha para consultar las checadas.</p>}
  </section>;
}
