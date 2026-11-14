const { Router } = require("express");
const { model, Schema } = require("mongoose");
const { fechaLocal } = require("../utils/asistencia");
const Trabajador = require("../models/Trabajador");
const Asistencia = require("../models/Asistencia");

const Festivo = model("Festivo", new Schema({
  _id: String,
  nombre: { type: String, required: true, maxlength: 80, trim: true },
}));
const router = Router();
router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
router.get("/festivos", async (_req, res) => {
  res.json({ festivos: await Festivo.find().sort({ _id: 1 }).lean() });
});
router.put("/festivos/:fecha", async (req, res) => {
  const { fecha } = req.params;
  const nombre = typeof req.body?.nombre === "string" ? req.body.nombre.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !Number.isFinite(Date.parse(fecha)) ||
      new Date(fecha).toISOString().slice(0, 10) !== fecha || !nombre || nombre.length > 80) {
    return res.status(400).json({ mensaje: "Selecciona una fecha válida y escribe un nombre de hasta 80 caracteres." });
  }
  await Festivo.updateOne({ _id: fecha }, { $set: { nombre } }, { upsert: true, runValidators: true });
  res.json({ festivo: { _id: fecha, nombre } });
});
router.get("/avisos-asistencia", async (_req, res) => {
  const hoy = fechaLocal();
  const desde = new Date(hoy);
  desde.setUTCDate(desde.getUTCDate() - 7);
  const rango = { $gte: desde.toISOString().slice(0, 10), $lt: hoy };
  const [personas, registros, festivos] = await Promise.all([
    Trabajador.find({ activo: true }).select("nombre createdAt").lean(),
    Asistencia.find({ fecha: rango }).select("trabajador fecha llegada salida").lean(),
    Festivo.find({ _id: rango }).select("_id").lean(),
  ]);
  const descanso = new Set(festivos.map(f => f._id));
  const porPersona = new Map(registros.map(r => [r.fecha + ":" + r.trabajador, r]));
  const avisos = [];
  for (let offset = 1; offset <= 7; offset++) {
    const dia = new Date(hoy);
    dia.setUTCDate(dia.getUTCDate() - offset);
    const fecha = dia.toISOString().slice(0, 10);
    for (const persona of personas) {
      const registro = porPersona.get(fecha + ":" + persona._id);
      const sinEntrada = !registro && dia.getUTCDay() >= 1 && dia.getUTCDay() <= 5 &&
        !descanso.has(fecha) && persona.createdAt && fecha > fechaLocal(persona.createdAt);
      if (sinEntrada || (registro?.llegada && !registro.salida)) {
        avisos.push({ id: fecha + ":" + persona._id, fecha, nombre: persona.nombre,
          tipo: sinEntrada ? "Sin entrada registrada" : "Sin salida registrada" });
      }
    }
  }
  res.json({ avisos });
});
router.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ mensaje: "No se pudo consultar o guardar la información del calendario." });
});
module.exports = router;
