const express = require("express");
const {
  crearTrabajador,
  obtenerTrabajadores,
  buscarTrabajador,
  actualizarTrabajador,
  obtenerTrabajosDelTrabajador,
} = require("../controllers/trabajadoresController");

const router = express.Router();

router.post("/", crearTrabajador);
router.get("/", obtenerTrabajadores);
router.get("/:id/trabajos", obtenerTrabajosDelTrabajador);
router.get("/:id", buscarTrabajador);
router.patch("/:id", actualizarTrabajador);

module.exports = router;
