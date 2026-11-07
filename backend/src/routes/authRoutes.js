const express = require("express");
const {
  iniciarSesion,
  obtenerSesion,
  listarUsuarios,
  crearUsuario,
  cambiarContrasenaUsuario,
  cambiarContrasena,
} = require("../controllers/authController");
const { autenticar, soloSuperadmin } = require("../middleware/autenticacion");

const router = express.Router();

router.post("/login", iniciarSesion);
router.get("/me", autenticar, obtenerSesion);
router.post("/change-password", autenticar, cambiarContrasena);
router.get("/users", autenticar, soloSuperadmin, listarUsuarios);
router.post("/users", autenticar, soloSuperadmin, crearUsuario);
router.patch("/users/:id/password", autenticar, soloSuperadmin, cambiarContrasenaUsuario);

module.exports = router;
