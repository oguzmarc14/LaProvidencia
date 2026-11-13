const express = require("express");
const mongoose = require("mongoose");
const Asistencia = require("../models/Asistencia");
const Trabajador = require("../models/Trabajador");
const { zona, distanciaMetros, fechaLocal } = require("../utils/asistencia");
const { soloAdmin } = require("../middleware/autenticacion");

const router = express.Router();
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/zona", (req, res) => res.json({ zona }));

router.get("/historial", soloAdmin, async (req, res) => {
  const fecha = req.query.fecha ?? fechaLocal();
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
      !Number.isFinite(Date.parse(fecha)) || new Date(fecha).toISOString().slice(0, 10) !== fecha) {
    return res.status(400).json({ mensaje: "Selecciona una fecha válida" });
  }
  try {
    const asistencias = await Asistencia.find({ fecha })
      .select("trabajador fecha llegada salida")
      .populate("trabajador", "nombre").sort({ llegada: -1 });
    return res.json({ fecha, zonaHoraria: zona.zonaHoraria, asistencias });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "No se pudo consultar el historial de asistencias" });
  }
});

router.get("/hoy", async (req, res) => {
  try {
    const fecha = fechaLocal();
    const filtro = req.usuario.rol === "usuario"
      ? { fecha, trabajador: req.usuario.trabajador }
      : { fecha };
    const asistencias = await Asistencia.find(filtro)
      .select("trabajador fecha llegada salida")
      .populate("trabajador", "nombre").sort({ llegada: -1 });
    res.json({ fecha, asistencias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "No se pudieron consultar las llegadas" });
  }
});

async function registrar(req, res, esSalida) {
  const { latitud, longitud, precision, tomadaEn } = req.body || {};
  const trabajador = req.usuario.rol === "usuario"
    ? String(req.usuario.trabajador)
    : req.body?.trabajador;
  const numero = (valor) => typeof valor === "number" && Number.isFinite(valor);
  if (typeof trabajador !== "string" || !mongoose.isValidObjectId(trabajador) ||
      !numero(latitud) || Math.abs(latitud) > 90 ||
      !numero(longitud) || Math.abs(longitud) > 180 ||
      !numero(precision) || precision < 0 || !numero(tomadaEn)) {
    return res.status(400).json({ mensaje: "Selecciona un trabajador y envía una ubicación válida" });
  }
  const ahora = new Date();
  if (ahora.getTime() - tomadaEn > 30000 || tomadaEn - ahora.getTime() > 5000) {
    return res.status(400).json({ mensaje: "La ubicación caducó. Vuelve a verificar tu ubicación" });
  }
  if (precision > zona.precisionMaxima) {
    return res.status(400).json({ mensaje: "La ubicación es poco precisa. Activa la ubicación precisa e inténtalo al aire libre" });
  }
  const distancia = distanciaMetros(latitud, longitud);
  if (distancia > zona.radioMetros) {
    return res.status(403).json({ mensaje: "Estás fuera del radio de 100 metros de la empresa" });
  }
  try {
    const persona = await Trabajador.findById(trabajador);
    if (!persona) return res.status(404).json({ mensaje: "Trabajador no encontrado" });
    if (!persona.activo) return res.status(403).json({ mensaje: "El trabajador está inactivo" });
    if (esSalida) {
      const filtro = { trabajador, fecha: fechaLocal(ahora) };
      // La condición evita sobrescribir la salida incluso con solicitudes simultáneas.
      const asistencia = await Asistencia.findOneAndUpdate(
        { ...filtro, salida: null, llegada: { $lte: ahora } },
        { $set: { salida: ahora } },
        { new: true, runValidators: true },
      );
      if (!asistencia) {
        const existe = await Asistencia.exists(filtro);
        return res.status(409).json({ mensaje: existe
          ? "La salida ya está registrada o la llegada es posterior a la hora actual"
          : "Primero registra tu llegada de hoy" });
      }
      return res.json({ mensaje: "Salida registrada", asistencia });
    }
    const asistencia = await Asistencia.create({
      trabajador, fecha: fechaLocal(ahora), llegada: ahora,
      latitud, longitud, precision, distanciaMetros: distancia,
    });
    return res.status(201).json({ mensaje: "Llegada registrada", asistencia });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: "Este trabajador ya registró su llegada hoy" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: esSalida ? "No se pudo registrar la salida" : "No se pudo registrar la llegada" });
  }
}

router.post("/", (req, res) => registrar(req, res, false));
router.post("/salida", (req, res) => registrar(req, res, true));

module.exports = router;
