const express = require("express");
const Trabajo = require("../models/Trabajo");
const Tarea = require("../models/Tarea");
const RegistroVenta = require("../models/RegistroVenta");

const router = express.Router();

router.get("/", async (req, res) => {
  const trabajador = req.usuario.trabajador;
  const [trabajos, tareas, gavetas] = await Promise.all([
    Trabajo.find({ $or: [{ trabajador }, { responsableTemple: trabajador }] })
      .select("nombre material medidas piezasTotales direccionInstalacion especificaciones fechaInicio fechaFinal estado")
      .sort({ fechaFinal: 1 }).lean(),
    Tarea.find({ trabajador })
      .select("titulo descripcion fechaInicio fechaLimite prioridad estado progreso")
      .sort({ fechaLimite: 1 }).lean(),
    RegistroVenta.find({ trabajador })
      .select("gaveta pasillo localidad modeloLapida materialLapida nombreDifunto epitafio fechaEntrega precioTotal")
      .sort({ fechaEntrega: 1 }).lean(),
  ]);
  res.set("Cache-Control", "no-store").json({ trabajos, tareas, gavetas });
});

module.exports = router;
