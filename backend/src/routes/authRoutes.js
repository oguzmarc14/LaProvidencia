const router = require("express").Router();
const { iniciarSesion, sesionActual } = require("../controllers/authController");
const { autenticar } = require("../middleware/autenticacion");

router.post("/login", iniciarSesion);
router.get("/me", autenticar, sesionActual);
module.exports = router;
