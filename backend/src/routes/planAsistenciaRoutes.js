const router = require("express").Router();
const mongoose = require("mongoose");
const Plan = require("../models/PlanAsistencia");
const Trabajador = require("../models/Trabajador");
const Asistencia = require("../models/Asistencia");
const { soloAdmin } = require("../middleware/autenticacion");
const { fechaLocal } = require("../utils/asistencia");
const { fechaValida, horaValida, minutos, evaluar } = require("../utils/jornada");
const envolver = fn => async (req, res) => {
  try { await fn(req, res); }
  catch (e) { console.error(e); res.status(500).json({ mensaje: "No se pudo completar la operación de asistencias" }); }
};

router.get("/auditoria", soloAdmin, envolver(async (req, res) => {
  const registros = await Asistencia.find({}).sort({ llegada: -1 }).limit(100)
    .populate("trabajador", "nombre").populate("entradaPor salidaPor", "usuario email").lean();
  res.json({ registros });
}));

router.get("/planes", soloAdmin, envolver(async (req, res) => {
  const planes = await Plan.find({}).sort({ createdAt: -1, _id: -1 }).limit(500)
    .populate("autor", "usuario email").populate("trabajador", "nombre").lean();
  res.json({ planes });
}));

router.post("/planes", soloAdmin, envolver(async (req, res) => {
  const { tipo, trabajador = null, desde, hasta = null, dias = [], tolerancia = 0, motivo } = req.body || {};
  if (!["horario", "festivo", "no_laborable", "laborable", "justificado"].includes(tipo) ||
      !fechaValida(desde) || (hasta !== null && (!fechaValida(hasta) || hasta < desde)) ||
      !Number.isInteger(tolerancia) || tolerancia < 0 || tolerancia > 180 ||
      typeof motivo !== "string" || !motivo.trim() || motivo.length > 500 ||
      (trabajador !== null && (typeof trabajador !== "string" || !mongoose.isValidObjectId(trabajador))) ||
      (["horario", "justificado"].includes(tipo) && !trabajador) ||
      (tipo !== "horario" && !hasta) || !Array.isArray(dias) || dias.length > 7) {
    return res.status(400).json({ mensaje: "Revisa alcance, fechas, motivo y tolerancia (0–180 minutos)" });
  }
  const requiereHoras = tipo === "horario" || tipo === "laborable";
  if (requiereHoras && (dias.some(d => !d || !Number.isInteger(d.dia) || d.dia < 0 || d.dia > 6 ||
      !horaValida(d.entrada) || !horaValida(d.salida) || minutos(d.salida) <= minutos(d.entrada)) ||
      new Set(dias.map(d => d.dia)).size !== dias.length || (tipo === "laborable" && dias.length !== 1))) {
    return res.status(400).json({ mensaje: "Usa días únicos y turnos que terminen después de la entrada, dentro del mismo día" });
  }
  if (trabajador && !(await Trabajador.exists({ _id: trabajador }))) return res.status(404).json({ mensaje: "Trabajador no encontrado" });
  // No se actualizan ni eliminan versiones; la creación es también el evento de auditoría atómico.
  const plan = await Plan.create({ tipo, trabajador, desde, hasta, dias: requiereHoras ? dias.map(({ dia, entrada, salida }) => ({ dia, entrada, salida })) : [],
    tolerancia, motivo: motivo.trim(), autor: req.usuario._id });
  res.status(201).json({ plan });
}));

router.get("/historial", envolver(async (req, res) => {
  const permitidos = new Set(["desde", "hasta", "trabajador", "estado", "buscar", "pagina", "formato"]);
  if (Object.keys(req.query).some(k => !permitidos.has(k)) || Object.values(req.query).some(v => typeof v !== "string")) {
    return res.status(400).json({ mensaje: "Filtros inválidos" });
  }
  const desde = req.query.desde ?? fechaLocal();
  const hasta = req.query.hasta ?? desde;
  const estados = ["programado", "no_laborable", "sin_horario", "justificado", "finalizado", "trabajando", "ausente", "pendiente", "retardo"];
  const personal = req.usuario.rol === "usuario";
  const trabajador = personal ? String(req.usuario.trabajador) : req.query.trabajador;
  if (!fechaValida(desde) || !fechaValida(hasta) || hasta < desde || (Date.parse(hasta) - Date.parse(desde)) / 86400000 > 30 ||
      (trabajador && (typeof trabajador !== "string" || !mongoose.isValidObjectId(trabajador))) ||
      (req.query.estado && !estados.includes(req.query.estado)) ||
      (req.query.buscar !== undefined && (typeof req.query.buscar !== "string" || req.query.buscar.length > 100))) {
    return res.status(400).json({ mensaje: "Selecciona un rango máximo de 31 días y filtros válidos" });
  }
  const pagina = Number(req.query.pagina ?? 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 100000) return res.status(400).json({ mensaje: "Página inválida" });
  const filtro = trabajador ? { _id: trabajador } : {};
  const filtroRegistro = { fecha: { $gte: desde, $lte: hasta }, ...(trabajador ? { trabajador } : {}) };
  const filtroPlan = { desde: { $lte: hasta }, ...(trabajador ? { $or: [{ trabajador }, { trabajador: null }] } : {}) };
  const [equipo, registros, planes] = await Promise.all([
    Trabajador.find(filtro).select("nombre activo createdAt").lean(),
    Asistencia.find(filtroRegistro).select("trabajador fecha llegada salida").lean(),
    Plan.find(filtroPlan).lean(),
  ]);
  const indice = new Map(registros.map(r => [`${r.trabajador}:${r.fecha}`, r]));
  const resumen = { trabajando: 0, finalizado: 0, ausente: 0, pendiente: 0, programado: 0, no_laborable: 0, sin_horario: 0, justificado: 0, retardos: 0 };
  const filas = [];
  for (let dia = Date.parse(desde); dia <= Date.parse(hasta); dia += 86400000) {
    const fecha = new Date(dia).toISOString().slice(0, 10);
    for (const persona of equipo) {
      const registro = indice.get(`${persona._id}:${fecha}`);
      if ((!persona.activo || (persona.createdAt && fecha < fechaLocal(persona.createdAt))) && !registro) continue;
      if (req.query.buscar && !persona.nombre.toLocaleLowerCase("es").includes(req.query.buscar.toLocaleLowerCase("es"))) continue;
      const fila = evaluar(persona, fecha, planes, registro);
      resumen[fila.estado]++;
      if (fila.retardo) resumen.retardos++;
      if (!req.query.estado || (req.query.estado === "retardo" ? fila.retardo > 0 : fila.estado === req.query.estado)) filas.push(fila);
    }
  }
  filas.sort((a, b) => b.fecha.localeCompare(a.fecha) || a.trabajador.nombre.localeCompare(b.trabajador.nombre, "es"));
  if (req.query.formato === "csv") {
    const celda = v => `"${String(v ?? "").replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
    const contenido = [["Fecha", "Trabajador", "Estado", "Entrada programada", "Salida programada", "Tolerancia min", "Entrada", "Salida", "Retardo min", "Minutos trabajados", "Motivo"],
      ...filas.map(f => [f.fecha, f.trabajador.nombre, f.estado, f.plan.entrada, f.plan.salida, f.plan.tolerancia, f.llegada && new Date(f.llegada).toISOString(), f.salida && new Date(f.salida).toISOString(), f.retardo, f.minutosTrabajados, f.plan.motivo])];
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="asistencias-${desde}-${hasta}.csv"`);
    return res.send("\uFEFF" + contenido.map(f => f.map(celda).join(",")).join("\r\n"));
  }
  res.json({ desde, hasta, resumen, total: filas.length, pagina, paginas: Math.ceil(filas.length / 100), filas: filas.slice((pagina - 1) * 100, pagina * 100) });
}));
module.exports = router;
