const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const DURACION_TOKEN = "7d";
const MINIMO_PASSWORD = 12;
const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const crearToken = (usuario) =>
  jwt.sign({ sub: usuario._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: DURACION_TOKEN,
  });

const datosPublicos = (usuario) => ({
  id: usuario._id,
  email: usuario.email,
  rol: usuario.rol,
  debeCambiarContrasena: Boolean(usuario.debeCambiarContrasena),
});

const iniciarSesion = async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!correoValido.test(email) || email.length > 254 || !password || password.length > 128) {
      return res.status(400).json({ mensaje: "Ingresa un correo y una contraseña válidos" });
    }

    const usuario = await Usuario.findOne({ email }).select("+password +debeCambiarContrasena");
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    return res.json({ token: crearToken(usuario), usuario: datosPublicos(usuario) });
  } catch (error) {
    return next(error);
  }
};

const obtenerSesion = (req, res) => res.json({ usuario: datosPublicos(req.usuario) });

const listarUsuarios = async (_req, res, next) => {
  try {
    const usuarios = await Usuario.find({ rol: "usuario" })
      .select("_id email rol debeCambiarContrasena createdAt")
      .sort({ createdAt: -1 });
    return res.json({ usuarios: usuarios.map(datosPublicos) });
  } catch (error) {
    return next(error);
  }
};

const crearUsuario = async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!correoValido.test(email) || email.length > 254 || password.length < MINIMO_PASSWORD || password.length > 128) {
      return res.status(400).json({
        mensaje: `Ingresa un correo válido y una contraseña de entre ${MINIMO_PASSWORD} y 128 caracteres`,
      });
    }

    const hash = await bcrypt.hash(password, 12);
    const usuario = await Usuario.create({
      email,
      password: hash,
      rol: "usuario",
      debeCambiarContrasena: true,
    });
    return res.status(201).json({ usuario: datosPublicos(usuario) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: "Ya existe una cuenta con ese correo" });
    }
    return next(error);
  }
};

const cambiarContrasenaUsuario = async (req, res, next) => {
  try {
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (password.length < MINIMO_PASSWORD || password.length > 128) {
      return res.status(400).json({
        mensaje: `La nueva contraseña debe tener entre ${MINIMO_PASSWORD} y 128 caracteres`,
      });
    }

    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido" });
    }

    const usuario = await Usuario.findOne({ _id: req.params.id, rol: "usuario" });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    usuario.password = await bcrypt.hash(password, 12);
    usuario.debeCambiarContrasena = true;
    await usuario.save();
    return res.json({ usuario: datosPublicos(usuario) });
  } catch (error) {
    return next(error);
  }
};

const cambiarContrasena = async (req, res, next) => {
  try {
    const actual = typeof req.body.contrasenaActual === "string" ? req.body.contrasenaActual : "";
    const nueva = typeof req.body.contrasenaNueva === "string" ? req.body.contrasenaNueva : "";
    if (nueva.length < MINIMO_PASSWORD || nueva.length > 128) {
      return res.status(400).json({
        mensaje: `La nueva contraseña debe tener entre ${MINIMO_PASSWORD} y 128 caracteres`,
      });
    }

    const usuario = await Usuario.findById(req.usuario._id).select("+password");
    if (!usuario || !(await bcrypt.compare(actual, usuario.password))) {
      return res.status(401).json({ mensaje: "La contraseña actual es incorrecta" });
    }
    usuario.password = await bcrypt.hash(nueva, 12);
    usuario.debeCambiarContrasena = false;
    await usuario.save();
    return res.json({ usuario: datosPublicos(usuario) });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  iniciarSesion,
  obtenerSesion,
  listarUsuarios,
  crearUsuario,
  cambiarContrasenaUsuario,
  cambiarContrasena,
};
