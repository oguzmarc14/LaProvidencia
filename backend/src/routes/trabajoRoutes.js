const express = require("express");
const {
  crearTrabajo,
  eliminarTrabajo,
} = require("../controllers/trabajosController");

const router = express.Router();

router.post("/", crearTrabajo);
router.delete("/:id", eliminarTrabajo);

module.exports = router;
