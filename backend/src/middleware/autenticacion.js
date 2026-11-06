const jwt = require("jsonwebtoken");

const autenticar = (req, res, next) => {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return res.status(401).json({ mensaje: "Inicia sesión para continuar." });
  try {
    const datos = jwt.verify(match[1], process.env.JWT_SECRET);
    if (!datos?.id) return res.status(401).json({ mensaje: "Sesión no válida." });
    req.usuario = { id: datos.id, rol: datos.rol };
    return next();
  } catch {
    return res.status(401).json({ mensaje: "La sesión ha expirado. Inicia sesión nuevamente." });
  }
};

module.exports = { autenticar };
