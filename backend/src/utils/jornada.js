const { zona, fechaLocal } = require("./asistencia");
const fechaValida = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const horaValida = v => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const minutos = v => Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
function minutosLocales(fecha) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: zona.zonaHoraria, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(fecha));
  return minutos(p);
}
function jornada(trabajador, fecha, planes) {
  const id = String(trabajador._id);
  const aplican = planes.filter(p => (!p.trabajador || String(p.trabajador) === id) && p.desde <= fecha && (!p.hasta || p.hasta >= fecha));
  const reciente = lista => lista.sort((a, b) => b.desde.localeCompare(a.desde) || new Date(b.createdAt) - new Date(a.createdAt) || String(b._id).localeCompare(String(a._id)))[0];
  const horario = reciente(aplican.filter(p => p.tipo === "horario"));
  const excepciones = aplican.filter(p => p.tipo !== "horario");
  // Excepción individual > general; la última versión con igual alcance y fecha gana.
  const regla = reciente(excepciones.filter(p => p.trabajador)) || reciente(excepciones.filter(p => !p.trabajador));
  const dia = new Date(`${fecha}T12:00:00Z`).getUTCDay();
  const turno = horario?.dias.find(d => d.dia === dia);
  const especial = regla?.tipo === "laborable" ? regla.dias[0] : null;
  const descanso = regla && regla.tipo !== "laborable";
  return {
    entrada: descanso ? null : especial?.entrada || turno?.entrada || null,
    salida: descanso ? null : especial?.salida || turno?.salida || null,
    tolerancia: especial ? regla.tolerancia : horario?.tolerancia ?? 0,
    motivo: regla?.motivo || (!horario ? "Sin horario configurado" : !turno ? "Descanso semanal" : "Jornada programada"),
    tipo: regla?.tipo || (!horario ? "sin_horario" : !turno ? "descanso" : "laborable"),
  };
}
function evaluar(trabajador, fecha, planes, registro, ahora = new Date()) {
  const plan = jornada(trabajador, fecha, planes);
  const hoy = fechaLocal(ahora);
  let estado = plan.entrada ? "programado" : "no_laborable";
  if (plan.tipo === "sin_horario") estado = "sin_horario";
  if (plan.tipo === "justificado") estado = "justificado";
  const retardo = registro && plan.entrada ? Math.max(0, minutosLocales(registro.llegada) - minutos(plan.entrada) - plan.tolerancia) : 0;
  if (registro) estado = registro.salida ? "finalizado" : "trabajando";
  else if (plan.entrada && fecha <= hoy) {
    if (fecha < hoy || minutosLocales(ahora) >= minutos(plan.salida)) estado = "ausente";
    else estado = minutosLocales(ahora) > minutos(plan.entrada) + plan.tolerancia ? "pendiente" : "programado";
  }
  return { trabajador: { _id: trabajador._id, nombre: trabajador.nombre, activo: trabajador.activo }, fecha, plan, estado,
    llegada: registro?.llegada || null, salida: registro?.salida || null, retardo,
    minutosTrabajados: registro?.salida ? Math.max(0, Math.floor((new Date(registro.salida) - new Date(registro.llegada)) / 60000)) : null };
}
module.exports = { fechaValida, horaValida, minutos, jornada, evaluar };
