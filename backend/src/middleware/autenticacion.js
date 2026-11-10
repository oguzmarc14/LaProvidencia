const jwt = require("jsonwebtoken");
const Trabajador = require("../models/Trabajador");
const Usuario = require("../models/Usuario");

const autenticar = async (req, res, next) => {
  const token = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "")?.[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Inicia sesión para continuar" });
  }

  try {
    const contenido = jwt.verify(token, process.env.JWT_SECRET);
    const id = contenido.sub ?? contenido.id;
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      return res.status(401).json({ mensaje: "La sesión ya no es válida" });
    }
    const usuario = await Usuario.findById(id)
      .select("_id email usuario rol trabajador versionSesion +debeCambiarContrasena");

    if (!usuario || (contenido.version ?? 0) !== (usuario.versionSesion ?? 0)) {
      return res.status(401).json({ mensaje: "La sesión ya no es válida" });
    }

    req.usuario = usuario;
    const ruta = req.originalUrl.split("?")[0];
    if (usuario.debeCambiarContrasena && !["/api/auth/me", "/api/auth/change-password"].includes(ruta)) {
      return res.status(403).json({ mensaje: "Cambia tu contraseña para continuar" });
    }
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ mensaje: "La sesión ya no es válida" });
    }
    return next(error);
  }
};

const soloAdmin = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.usuario?.rol)) {
    return res.status(403).json({ mensaje: "No tienes permiso para realizar esta acción" });
  }
  return next();
};

const soloTrabajadorActivo = async (req, res, next) => {
  const { rol, trabajador } = req.usuario;
  if (rol !== "usuario" || !trabajador ||
      !(await Trabajador.exists({ _id: trabajador, activo: true }))) {
    return res.status(403).json({ mensaje: "Tu acceso requiere una ficha de trabajador activa" });
  }
  return next();
};

const adminOTrabajadorActivo = (req, res, next) =>
  req.usuario.rol === "usuario" ? soloTrabajadorActivo(req, res, next) : soloAdmin(req, res, next);

module.exports = { autenticar, soloAdmin, soloTrabajadorActivo, adminOTrabajadorActivo };
