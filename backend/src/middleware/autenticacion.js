const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const autenticar = async (req, res, next) => {
  const encabezado = req.headers.authorization;
  const token = encabezado?.startsWith("Bearer ") ? encabezado.slice(7) : null;

  if (!token) {
    return res.status(401).json({ mensaje: "Inicia sesión para continuar" });
  }

  try {
    const contenido = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(contenido.sub)
      .select("_id email rol +debeCambiarContrasena");

    if (!usuario) {
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

const soloSuperadmin = (req, res, next) => {
  if (req.usuario?.rol !== "superadmin") {
    return res.status(403).json({ mensaje: "No tienes permiso para realizar esta acción" });
  }
  return next();
};

module.exports = { autenticar, soloSuperadmin };
