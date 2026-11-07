const express = require("express");
const {
  iniciarSesion,
  obtenerSesion,
  listarUsuarios,
  crearUsuario,
  cambiarContrasenaUsuario,
  cambiarContrasena,
} = require("../controllers/authController");
const { autenticar, soloAdmin } = require("../middleware/autenticacion");

const router = express.Router();

router.post("/login", iniciarSesion);
router.get("/me", autenticar, obtenerSesion);
router.post("/change-password", autenticar, cambiarContrasena);
router.get("/users", autenticar, soloAdmin, listarUsuarios);
router.post("/users", autenticar, soloAdmin, crearUsuario);
router.patch("/users/:id/password", autenticar, soloAdmin, cambiarContrasenaUsuario);

module.exports = router;
