const express = require("express");
const { obtenerTrabajos, obtenerTrabajo, crearTrabajo, actualizarTrabajo, eliminarTrabajo } = require("../controllers/trabajosController");
const router = express.Router();
router.get("/", obtenerTrabajos);
router.get("/:id", obtenerTrabajo);
router.post("/", crearTrabajo);
router.patch("/:id", actualizarTrabajo);
router.delete("/:id", eliminarTrabajo);
module.exports = router;
