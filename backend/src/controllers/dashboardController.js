const Cliente = require("../models/Clientes");
const Trabajador = require("../models/Trabajador");
const Trabajo = require("../models/Trabajo");

const obtenerResumen = async (req, res) => {
  try {
    const [totalClientes, totalTrabajadores, trabajadoresActivos, totalTrabajos, finalizados, porEstado, trabajosRecientes] = await Promise.all([
      Cliente.countDocuments(),
      Trabajador.countDocuments(),
      Trabajador.countDocuments({ activo: true }),
      Trabajo.countDocuments(),
      Trabajo.countDocuments({ estado: "finalizado" }),
      Trabajo.aggregate([{ $group: { _id: "$estado", total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Trabajo.find().select("nombre material estado fechaInicio fechaFinal").sort({ _id: -1 }).limit(5).lean(),
    ]);
    return res.status(200).json({
      resumen: { totalClientes, totalTrabajadores, trabajadoresActivos, totalTrabajos, finalizados, enProceso: totalTrabajos - finalizados },
      porEstado: porEstado.map((e) => ({ estado: e._id || "sin estado", total: e.total })),
      trabajosRecientes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "No se pudo obtener el resumen del dashboard" });
  }
};

module.exports = { obtenerResumen };
