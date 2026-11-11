import { useEffect, useState } from "react";
import { CalendarDays, Clock, Download, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { solicitarApi, obtenerToken } from "../../../services/api";
import { obtenerTrabajadores } from "../../trabajadores/services/trabajadoresService";
import RelojAsistencia from "./SeccionAsistencias";
import "./asistencias.css";

const api = (ruta, opciones) => solicitarApi(`/api/asistencias${ruta}`, { cache: "no-store", ...opciones });
const hoy = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const nombres = { trabajando: "Trabajando", finalizado: "Finalizado", ausente: "Ausente", pendiente: "Pendiente", programado: "Programado", no_laborable: "No laborable", sin_horario: "Sin horario", justificado: "Justificado", retardo: "Con retardo" };
const tipos = { horario: "Horario semanal", festivo: "Día festivo", no_laborable: "No laborable", laborable: "Jornada excepcional", justificado: "Ausencia justificada" };
const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const hora = valor => valor ? new Date(valor).toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: "2-digit", minute: "2-digit" }) : "—";
const fechaHora = valor => new Date(valor).toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
const nuevosDias = () => diasSemana.map((_, dia) => ({ dia, activo: dia > 0 && dia < 6, entrada: "08:00", salida: "17:00" }));

function EditorPlan({ equipo, tipoInicial, alGuardar }) {
  const [tipo, setTipo] = useState(tipoInicial);
  const [trabajador, setTrabajador] = useState("");
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [dias, setDias] = useState(nuevosDias);
  const [tolerancia, setTolerancia] = useState(10);
  const [motivo, setMotivo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const semanal = tipo === "horario";
  const horas = semanal || tipo === "laborable";
  const cambiarDia = (dia, campo, valor) => setDias(prev => prev.map(d => d.dia === dia ? { ...d, [campo]: valor } : d));
  async function guardar(e) {
    e.preventDefault(); setOcupado(true); setMensaje(null);
    try {
      await api("/planes", { method: "POST", body: JSON.stringify({ tipo, trabajador: trabajador || null, desde, hasta: semanal ? null : hasta,
        dias: horas ? (semanal ? dias.filter(d => d.activo) : [dias[0]]).map(({ dia, entrada, salida }) => ({ dia, entrada, salida })) : [], tolerancia: Number(tolerancia), motivo }) });
      setMensaje({ bien: true, texto: "Configuración guardada. Se añadió una versión a la auditoría." });
      setMotivo(""); alGuardar();
    } catch (error) { setMensaje({ bien: false, texto: error.message }); }
    finally { setOcupado(false); }
  }
  return <form onSubmit={guardar} className="as-card as-editor">
    <div className="as-section-title"><CalendarDays aria-hidden="true"/><div><h2>{semanal ? "Horario por trabajador" : "Calendario y excepciones"}</h2><p>{semanal ? "Define sus días laborales, descansos y tolerancia." : "Los días no laborables y justificados no generan faltas."}</p></div></div>
    <fieldset disabled={ocupado}>
      {!semanal && <label>Tipo de excepción<select value={tipo} onChange={e => setTipo(e.target.value)}>{Object.entries(tipos).filter(([k]) => k !== "horario").map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>}
      <div className="as-form-grid">
        <label>{semanal ? "Trabajador" : "Alcance"}<select required={semanal || tipo === "justificado"} value={trabajador} onChange={e => setTrabajador(e.target.value)}><option value="">{semanal || tipo === "justificado" ? "Selecciona un trabajador" : "Todo el equipo"}</option>{equipo.map(p => <option key={p._id} value={p._id}>{p.nombre}{!p.activo ? " (inactivo)" : ""}</option>)}</select></label>
        <label>Vigente desde<input required type="date" value={desde} onChange={e => setDesde(e.target.value)}/></label>
        {!semanal && <label>Hasta (incluido)<input required type="date" min={desde} value={hasta} onChange={e => setHasta(e.target.value)}/></label>}
        {horas && <label>Tolerancia (minutos)<input required type="number" min="0" max="180" value={tolerancia} onChange={e => setTolerancia(e.target.value)}/></label>}
      </div>
      {horas && <div className="as-week">{(semanal ? dias : [dias[0]]).map(d => <div key={d.dia} className="as-day">
        {semanal ? <label className="as-check"><input type="checkbox" checked={d.activo} onChange={e => cambiarDia(d.dia, "activo", e.target.checked)}/>{diasSemana[d.dia]}</label> : <strong>Turno excepcional</strong>}
        <label>Entrada<input required={semanal ? d.activo : true} disabled={semanal && !d.activo} type="time" value={d.entrada} onChange={e => cambiarDia(d.dia, "entrada", e.target.value)}/></label>
        <label>Salida<input required={semanal ? d.activo : true} disabled={semanal && !d.activo} type="time" value={d.salida} onChange={e => cambiarDia(d.dia, "salida", e.target.value)}/></label>
        {semanal && !d.activo && <span className="as-muted">Descanso</span>}
      </div>)}</div>}
      {horas && <p className="as-note">Turnos dentro del mismo día. La salida debe ser posterior a la entrada. Un horario sin días activos representa descanso toda la semana.</p>}
      <label>Motivo del cambio<textarea required maxLength={500} rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Explica la configuración para conservar su trazabilidad"/></label>
      <p className="as-note">Se conserva cada versión. Para sustituir una regla, agrega otra con el mismo alcance y fecha de inicio. Una excepción individual tiene prioridad sobre una general.</p>
      <button className="as-button as-primary" disabled={ocupado}>{ocupado ? "Guardando…" : "Guardar configuración"}</button>
    </fieldset>
    {mensaje && <p role={mensaje.bien ? "status" : "alert"} className={mensaje.bien ? "as-success" : "as-error"}>{mensaje.texto}</p>}
  </form>;
}

export default function PanelAsistencias({ miTrabajador } = {}) {
  const personal = !!miTrabajador;
  const [tab, setTab] = useState("control");
  const [equipo, setEquipo] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [filtros, setFiltros] = useState(() => ({ desde: hoy(), hasta: hoy(), trabajador: "", estado: "", buscar: "" }));
  const [consulta, setConsulta] = useState(filtros);
  const [pagina, setPagina] = useState(1);
  const [version, setVersion] = useState(0);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const parametros = new URLSearchParams(Object.entries(consulta).filter(([, v]) => v)).toString();

  useEffect(() => {
    if (personal || tab !== "auditoria") return;
    let activo = true;
    api("/auditoria").then(d => { if (activo) setAuditoria(d.registros); }).catch(e => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, [personal, tab, version]);
  useEffect(() => {
    if (personal) return;
    let activo = true;
    Promise.all([obtenerTrabajadores(), api("/planes")]).then(([e, p]) => { if (activo) { setEquipo(e.trabajadores); setPlanes(p.planes); } }).catch(e => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, [personal, version]);
  useEffect(() => {
    const controller = new AbortController();
    setCargando(true); setError("");
    api(`/historial?${parametros}&pagina=${pagina}`, { signal: controller.signal }).then(d => { if (!controller.signal.aborted) setDatos(d); })
      .catch(e => { if (!controller.signal.aborted) { setError(e.message); setDatos(null); } }).finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [parametros, pagina, version]);

  const refrescar = () => setVersion(v => v + 1);
  async function exportar() {
    setExportando(true); setError("");
    try {
      const base = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim().replace(/\/+$/, "");
      const r = await fetch(`${base}/api/asistencias/historial?${parametros}&formato=csv`, { cache: "no-store", headers: { Authorization: `Bearer ${obtenerToken()}` } });
      if (!r.ok) throw new Error((await r.json()).mensaje || "No se pudo exportar el reporte");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a"); a.href = url; a.download = `asistencias-${consulta.desde}-${consulta.hasta}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e.message); } finally { setExportando(false); }
  }
  const jornadaHoy = personal && datos?.filas.find(f => f.fecha === hoy());
  return <section className="as-module">
    <header className="as-hero"><div><span className="as-eyebrow">LA PROVIDENCIA · EQUIPO</span><h1>{personal ? "Mi asistencia" : "Control de asistencias"}</h1><p>{personal ? "Tu jornada, tus registros y tu historial en un solo lugar." : "Una vista clara de cada jornada. Horarios que se adaptan a tu equipo."}</p><span className="as-zone"><Clock size={14} aria-hidden="true"/> Horario de Ciudad de México</span></div><div className="as-hero-icon"><Users size={42} aria-hidden="true"/></div></header>
    {!personal && <nav className="as-tabs" aria-label="Secciones de asistencias">{[["control", "Control y reportes"], ["checar", "Registrar asistencia"], ["horarios", "Horarios"], ["calendario", "Calendario"], ["auditoria", "Auditoría"]].map(([id, nombre]) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{nombre}</button>)}</nav>}
    {error && <p role="alert" className="as-error">{error} <button onClick={refrescar}>Reintentar</button></p>}
    {personal && <>
      {jornadaHoy && <article className="as-card as-today"><div><span className="as-eyebrow">MI JORNADA DE HOY</span><h2>{jornadaHoy.plan.entrada ? `${jornadaHoy.plan.entrada} – ${jornadaHoy.plan.salida}` : nombres[jornadaHoy.estado]}</h2><p>{jornadaHoy.plan.motivo} · Tolerancia: {jornadaHoy.plan.tolerancia} min</p></div><span className={`as-badge ${jornadaHoy.estado}`}>{nombres[jornadaHoy.estado]}</span></article>}
      <RelojAsistencia compacto miTrabajador={miTrabajador} alRegistrar={refrescar}/>
    </>}
    {!personal && tab === "checar" && <RelojAsistencia alRegistrar={refrescar}/>}
    {!personal && tab === "horarios" && <EditorPlan key="horario" tipoInicial="horario" equipo={equipo} alGuardar={refrescar}/>}
    {!personal && tab === "calendario" && <EditorPlan key="calendario" tipoInicial="festivo" equipo={equipo} alGuardar={refrescar}/>}
    {!personal && tab === "auditoria" && <section className="as-card"><div className="as-section-title"><ShieldCheck aria-hidden="true"/><div><h2>Evidencia de registros</h2><p>Últimas 100 jornadas registradas. Horas del servidor y ubicación de cada checada.</p></div></div>{!auditoria.length ? <p className="as-empty">Sin registros de asistencia.</p> : <div className="as-table-wrap"><table><thead><tr><th>Trabajador / fecha</th><th>Entrada / responsable</th><th>Salida / responsable</th><th>GPS de entrada</th><th>GPS de salida</th></tr></thead><tbody>{auditoria.map(r => <tr key={r._id}><td>{r.trabajador?.nombre || "Ficha no disponible"}<small>{r.fecha}</small></td><td>{hora(r.llegada)}<small>{r.entradaPor?.usuario || r.entradaPor?.email || "Registro anterior al módulo"}</small></td><td>{hora(r.salida)}<small>{r.salidaPor?.usuario || r.salidaPor?.email || "—"}</small></td><td>{r.latitud}, {r.longitud}<small>±{Math.ceil(r.precision)} m · Distancia: {Math.ceil(r.distanciaMetros)} m</small></td><td>{r.salidaGPS?.latitud != null ? <>{r.salidaGPS.latitud}, {r.salidaGPS.longitud}<small>±{Math.ceil(r.salidaGPS.precision)} m · Distancia: {Math.ceil(r.salidaGPS.distanciaMetros)} m</small></> : "Sin evidencia histórica de salida"}</td></tr>)}</tbody></table></div>}</section>}
    {!personal && (tab === "auditoria" || tab === "horarios" || tab === "calendario") && <section className="as-card"><div className="as-section-title"><ShieldCheck aria-hidden="true"/><div><h2>{tab === "auditoria" ? "Auditoría de configuración" : "Versiones registradas"}</h2><p>Últimas 500 versiones · Los registros originales de GPS se conservan.</p></div></div>
      {!planes.length ? <p className="as-empty">Aún no hay configuraciones registradas.</p> : <div className="as-table-wrap"><table><thead><tr><th>Registro / autor</th><th>Alcance</th><th>Tipo / vigencia</th><th>Detalle</th><th>Motivo</th></tr></thead><tbody>{planes.filter(p => tab === "auditoria" || (tab === "horarios" ? p.tipo === "horario" : p.tipo !== "horario")).map(p => <tr key={p._id}><td>{fechaHora(p.createdAt)}<small>{p.autor?.usuario || p.autor?.email || "Cuenta no disponible"}</small></td><td>{p.trabajador?.nombre || "Todo el equipo"}</td><td>{tipos[p.tipo]}<small>{p.desde} → {p.hasta || "Sin fin"}</small></td><td>{p.dias.map(d => `${p.tipo === "horario" ? diasSemana[d.dia] + " " : ""}${d.entrada}–${d.salida}`).join(" · ") || "No laborable"}<small>Tolerancia: {p.tolerancia} min</small></td><td>{p.motivo}</td></tr>)}</tbody></table></div>}
    </section>}
    {(personal || tab === "control") && <>
      {!personal && <div className="as-stats">{[["trabajando", "En jornada"], ["finalizado", "Finalizaron"], ["pendiente", "Pendientes"], ["ausente", "Ausencias"], ["retardos", "Retardos"]].map(([k, v]) => <article key={k} className="as-card"><span>{v}</span><strong>{cargando ? "…" : datos?.resumen[k] ?? "—"}</strong><small>En el rango consultado</small></article>)}</div>}
      <section className="as-card"><div className="as-section-title"><CalendarDays aria-hidden="true"/><div><h2>{personal ? "Mi historial" : "Registro de jornadas"}</h2><p>Consulta hasta 31 días por reporte. Los festivos y descansos se distinguen de las ausencias.</p></div></div>
        <form className="as-filters" onSubmit={e => { e.preventDefault(); setPagina(1); setConsulta({ ...filtros }); }}>
          <label>Desde<input required type="date" value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })}/></label><label>Hasta<input required type="date" min={filtros.desde} value={filtros.hasta} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })}/></label>
          {!personal && <><label>Trabajador<select value={filtros.trabajador} onChange={e => setFiltros({ ...filtros, trabajador: e.target.value })}><option value="">Todo el equipo</option>{equipo.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}</select></label><label>Buscar nombre<input maxLength={100} type="search" value={filtros.buscar} onChange={e => setFiltros({ ...filtros, buscar: e.target.value })} placeholder="Nombre del trabajador"/></label></>}
          <label>Estado<select value={filtros.estado} onChange={e => setFiltros({ ...filtros, estado: e.target.value })}><option value="">Todos los estados</option>{Object.entries(nombres).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label><button className="as-button as-primary">Consultar</button>
        </form>
        <div className="as-toolbar"><p>{datos ? `${datos.total} jornadas · ${datos.desde} al ${datos.hasta}` : "Consulta los registros"}</p><div><button disabled={cargando} className="as-button" onClick={refrescar}><RefreshCw size={15} aria-hidden="true"/>Actualizar</button><button disabled={cargando || exportando || !datos} className="as-button" onClick={exportar}><Download size={15} aria-hidden="true"/>{exportando ? "Exportando…" : "Exportar CSV"}</button></div></div>
        {cargando ? <p role="status" className="as-empty">Consultando jornadas…</p> : !datos?.filas.length ? <p className="as-empty">No hay jornadas para estos filtros.</p> : <div className="as-table-wrap"><table className="as-jornadas"><thead><tr><th>Trabajador / fecha</th><th>Jornada prevista</th><th>Entrada / salida</th><th>Estado</th><th>Tiempo</th></tr></thead><tbody>{datos.filas.map(f => <tr key={`${f.trabajador._id}:${f.fecha}`}><td data-label="Trabajador"><strong>{personal ? "Mi jornada" : f.trabajador.nombre}</strong><small>{f.fecha}</small></td><td data-label="Jornada prevista">{f.plan.entrada ? `${f.plan.entrada} – ${f.plan.salida}` : "Sin jornada"}<small>{f.plan.motivo}</small><small>Tolerancia: {f.plan.tolerancia} min</small></td><td data-label="Entrada / salida">{hora(f.llegada)} / {hora(f.salida)}</td><td data-label="Estado"><span className={`as-badge ${f.estado}`}>{nombres[f.estado]}</span>{f.retardo > 0 && <small className="as-late">Retardo: {f.retardo} min fuera de tolerancia</small>}</td><td data-label="Tiempo trabajado">{f.minutosTrabajados === null ? "—" : `${Math.floor(f.minutosTrabajados / 60)} h ${f.minutosTrabajados % 60} min`}</td></tr>)}</tbody></table></div>}
        {datos?.paginas > 1 && <div className="as-pagination"><button className="as-button" disabled={pagina <= 1 || cargando} onClick={() => setPagina(p => p - 1)}>Anterior</button><span>Página {pagina} de {datos.paginas}</span><button className="as-button" disabled={pagina >= datos.paginas || cargando} onClick={() => setPagina(p => p + 1)}>Siguiente</button></div>}
      </section>
    </>}
  </section>;
}
