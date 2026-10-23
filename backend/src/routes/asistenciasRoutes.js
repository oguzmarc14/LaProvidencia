const express = require("express");
const mongoose = require("mongoose");
const Asistencia = require("../models/Asistencia");
const Trabajador = require("../models/Trabajador");
const { zona, distanciaMetros, fechaLocal } = require("../utils/asistencia");

const router = express.Router();
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/zona", (req, res) => res.json({ zona }));

router.get("/hoy", async (req, res) => {
  try {
    const fecha = fechaLocal();
    const asistencias = await Asistencia.find({ fecha })
      .select("trabajador fecha llegada")
      .populate("trabajador", "nombre").sort({ llegada: -1 });
    res.json({ fecha, asistencias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "No se pudieron consultar las llegadas" });
  }
});

router.post("/", async (req, res) => {
  const { trabajador, latitud, longitud, precision, tomadaEn } = req.body || {};
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
    return res.status(500).json({ mensaje: "No se pudo registrar la llegada" });
  }
});

module.exports = router;
