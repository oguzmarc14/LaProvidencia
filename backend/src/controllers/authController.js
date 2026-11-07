const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const iniciarSesion = async (req, res) => {
  try {
    const identificador = String(req.body?.identificador ?? req.body?.email ?? req.body?.usuario ?? "").trim();
    const password = req.body?.password;
    if (!identificador || typeof password !== "string" || !password) {
      return res.status(400).json({ mensaje: "Ingresa tu usuario o correo y contraseña." });
    }
    const cuenta = await Usuario.findOne({
      $or: [{ email: identificador.toLowerCase() }, { usuario: identificador }]
    }).select("+password");
    const correcto = cuenta && await bcrypt.compare(password, cuenta.password);
    if (!correcto) return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos." });
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      console.error("Configura JWT_SECRET de al menos 32 caracteres.");
      return res.status(500).json({ mensaje: "La autenticación no está configurada." });
    }
    const token = jwt.sign({ id: cuenta._id.toString(), rol: cuenta.rol }, process.env.JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token, usuario: { id: cuenta._id, email: cuenta.email, usuario: cuenta.usuario, rol: cuenta.rol } });
  } catch (error) {
    console.error("Error de autenticación:", error);
    return res.status(500).json({ mensaje: "No se pudo iniciar sesión." });
  }
};

const sesionActual = async (req, res) => {
  try {
    const cuenta = await Usuario.findById(req.usuario.id).select("email usuario rol");
    if (!cuenta) return res.status(401).json({ mensaje: "Sesión no válida." });
    return res.json({ usuario: { id: cuenta._id, email: cuenta.email, usuario: cuenta.usuario, rol: cuenta.rol } });
  } catch (error) {
    return res.status(500).json({ mensaje: "No se pudo consultar la sesión." });
  }
};

module.exports = { iniciarSesion, sesionActual };
