const express = require("express");
const {
  crearTrabajo,
  obtenerTrabajos,
  obtenerTrabajo,
  actualizarTrabajo,
  eliminarTrabajo,
} = require("../controllers/trabajosController");

const router = express.Router();

// Express también responde HEAD para las rutas GET, sin enviar el cuerpo.
router.get("/", obtenerTrabajos);
router.get("/:id", obtenerTrabajo);
router.post("/", crearTrabajo);
router.put("/:id", actualizarTrabajo);
router.delete("/:id", eliminarTrabajo);

module.exports = router;
