const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Trabajador = require("../models/Trabajador");
const Usuario = require("../models/Usuario");

const DURACION_TOKEN = "12h";
const MINIMO_PASSWORD = 12;
const MINIMO_PASSWORD_TRABAJADOR = 8;
const correoValido = /^[^\s@]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/;

const crearToken = (usuario) =>
  jwt.sign({ sub: usuario._id.toString(), version: usuario.versionSesion ?? 0 }, process.env.JWT_SECRET, {
    expiresIn: DURACION_TOKEN,
  });

const datosPublicos = (usuario) => ({
  id: usuario._id,
  email: usuario.email,
  usuario: usuario.usuario,
  rol: usuario.rol === "superadmin" ? "admin" : usuario.rol,
  trabajador: usuario.trabajador,
  debeCambiarContrasena: Boolean(usuario.debeCambiarContrasena),
});

const iniciarSesion = async (req, res, next) => {
  try {
    const entrada = req.body?.identificador ?? req.body?.email ?? req.body?.usuario;
    const identificador = typeof entrada === "string" ? entrada.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!identificador || identificador.length > 254 || !password || password.length > 128) {
      return res.status(400).json({ mensaje: "Ingresa tu usuario o correo y una contraseña válida" });
    }

    const usuario = await Usuario.findOne({
      $or: [{ email: identificador.toLowerCase() }, { usuario: identificador }],
    }).select("+password +debeCambiarContrasena");
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
      .select("_id email rol trabajador +debeCambiarContrasena createdAt")
      .sort({ createdAt: -1 });
    return res.json({ usuarios: usuarios.map(datosPublicos) });
  } catch (error) {
    return next(error);
  }
};

const crearUsuario = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!correoValido.test(email) || email.length > 254) {
      return res.status(400).json({ mensaje: "Ingresa un correo de acceso válido, por ejemplo ricardo@laprovidencia" });
    }
    if (password.length < MINIMO_PASSWORD_TRABAJADOR || password.length > 128) {
      return res.status(400).json({
        mensaje: `La contraseña debe tener entre ${MINIMO_PASSWORD_TRABAJADOR} y 128 caracteres`,
      });
    }

    const trabajador = req.body?.trabajador;
    if (typeof trabajador !== "string" || !/^[a-f\d]{24}$/i.test(trabajador)) {
      return res.status(400).json({ mensaje: "Selecciona una ficha de trabajador válida" });
    }
    if (!(await Trabajador.exists({ _id: trabajador, activo: true }))) {
      return res.status(404).json({ mensaje: "No se encontró un trabajador activo con esa ficha" });
    }

    // Un correo heredado sin ficha puede vincularse una sola vez.
    const usuario = await Usuario.findOneAndUpdate(
      { email, rol: "usuario", trabajador: null },
      {
        $set: { trabajador, password: await bcrypt.hash(password, 12), debeCambiarContrasena: true },
        $inc: { versionSesion: 1 },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    return res.status(201).json({ usuario: datosPublicos(usuario) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: "El correo o la ficha del trabajador ya tiene una cuenta vinculada" });
    }
    return next(error);
  }
};

const cambiarContrasenaUsuario = async (req, res, next) => {
  try {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (password.length < MINIMO_PASSWORD_TRABAJADOR || password.length > 128) {
      return res.status(400).json({
        mensaje: `La nueva contraseña debe tener entre ${MINIMO_PASSWORD_TRABAJADOR} y 128 caracteres`,
      });
    }

    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido" });
    }

    const usuario = await Usuario.findOneAndUpdate(
      { _id: req.params.id, rol: "usuario", trabajador: { $ne: null } },
      {
        $set: { password: await bcrypt.hash(password, 12), debeCambiarContrasena: true },
        $inc: { versionSesion: 1 },
      },
      { returnDocument: "after" },
    );
    if (!usuario) return res.status(404).json({ mensaje: "Acceso de trabajador no encontrado" });
    return res.json({ usuario: datosPublicos(usuario) });
  } catch (error) {
    return next(error);
  }
};

const cambiarContrasena = async (req, res, next) => {
  try {
    const actual = typeof req.body?.contrasenaActual === "string" ? req.body.contrasenaActual : "";
    const nueva = typeof req.body?.contrasenaNueva === "string" ? req.body.contrasenaNueva : "";
    const minimo = req.usuario.rol === "usuario" ? MINIMO_PASSWORD_TRABAJADOR : MINIMO_PASSWORD;
    if (nueva.length < minimo || nueva.length > 128) {
      return res.status(400).json({
        mensaje: `La nueva contraseña debe tener entre ${minimo} y 128 caracteres`,
      });
    }

    const usuario = await Usuario.findById(req.usuario._id).select("+password");
    if (!usuario || !(await bcrypt.compare(actual, usuario.password))) {
      return res.status(401).json({ mensaje: "La contraseña actual es incorrecta" });
    }
    const actualizado = await Usuario.findOneAndUpdate(
      { _id: usuario._id, password: usuario.password },
      {
        $set: { password: await bcrypt.hash(nueva, 12), debeCambiarContrasena: false },
        $inc: { versionSesion: 1 },
      },
      { returnDocument: "after" },
    );
    if (!actualizado) return res.status(409).json({ mensaje: "La contraseña cambió. Vuelve a iniciar sesión." });
    return res.json({ token: crearToken(actualizado), usuario: datosPublicos(actualizado) });
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
