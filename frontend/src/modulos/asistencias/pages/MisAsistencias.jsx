import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { obtenerMisRegistros } from "../services/asistenciasService";

const formatoFecha = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" });
const dia = fecha => formatoFecha.format(new Date(fecha));

export default function MisAsistencias() {
  const [periodo, setPeriodo] = useState("semana");
  const [fecha, setFecha] = useState("");
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    obtenerMisRegistros(periodo, fecha, controller.signal)
      .then(respuesta => { if (!controller.signal.aborted) setDatos(respuesta); })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [periodo, fecha]);

  const cambiar = (actualizar, valor) => {
    setDatos(null);
    setError("");
    actualizar(valor);
  };
  const hora = valor => valor ? new Date(valor).toLocaleTimeString("es-MX", {
    timeZone: datos.zonaHoraria, hour: "2-digit", minute: "2-digit",
  }) : "Sin registro";

  return <section className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
    <div className="flex items-center gap-3 text-[#203d6b]">
      <CalendarDays aria-hidden="true" />
      <h2 className="text-2xl font-extrabold">Mis asistencias</h2>
    </div>
    <div className="app-panel space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div role="group" aria-label="Periodo" className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {[["semana", "Semanal"], ["mes", "Mensual"]].map(([id, nombre]) => (
            <button key={id} type="button" aria-pressed={periodo === id} onClick={() => { if (periodo !== id) cambiar(setPeriodo, id); }}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${periodo === id ? "bg-[#123e83] text-white" : "text-slate-700"}`}>{nombre}</button>
          ))}
        </div>
        <label className="text-sm font-semibold text-slate-700">
          Fecha del periodo
          <input type="date" value={fecha} onChange={e => cambiar(setFecha, e.target.value)} className="app-field mt-1 block" />
        </label>
      </div>
      {error ? <p role="alert" className="text-rose-700">{error}</p> :
        !datos ? <p role="status">Consultando asistencias…</p> : <>
          <p className="text-sm font-semibold text-slate-600">{dia(datos.desde)} al {dia(datos.hasta)}</p>
          {datos.asistencias.length ? <ul className="divide-y divide-slate-100">
            {datos.asistencias.map(registro => <li key={registro._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <time className="font-bold" dateTime={registro.fecha}>{dia(registro.fecha)}</time>
              <span className="text-sm text-slate-700">Entrada {hora(registro.llegada)} · Salida {hora(registro.salida)}</span>
            </li>)}
          </ul> : <p className="text-slate-600">No tienes checadas en este periodo.</p>}
        </>}
    </div>
  </section>;
}
