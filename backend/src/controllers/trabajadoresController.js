const mongoose = require("mongoose");
const Trabajador = require("../models/Trabajador");
const Trabajo = require("../models/Trabajo");

const nombreInvalido = (nombre) =>
  typeof nombre !== "string" || nombre.trim().length === 0;

const whatsappInvalido = (whatsapp) =>
  whatsapp !== undefined && typeof whatsapp !== "string";

const errorServidor = (res, error) => {
  console.error(error);
  if (error.name === "ValidationError") {
    return res.status(400).json({ mensaje: "Datos del trabajador no válidos" });
  }
  return res.status(500).json({ mensaje: "Error interno del servidor" });
};

const crearTrabajador = async (req, res) => {
  try {
    const { nombre, whatsapp } = req.body;
    if (nombreInvalido(nombre) || whatsappInvalido(whatsapp)) {
      return res.status(400).json({ mensaje: "Verifica nombre y WhatsApp" });
    }
    const trabajador = await Trabajador.create({ nombre, whatsapp });
    return res.status(201).json({ mensaje: "Trabajador registrado", trabajador });
  } catch (error) {
    return errorServidor(res, error);
  }
};

const obtenerTrabajadores = async (req, res) => {
  try {
    const trabajadores = await Trabajador.find().sort({ nombre: 1 });
    return res.status(200).json({ trabajadores });
  } catch (error) {
    return errorServidor(res, error);
  }
};

const buscarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID de trabajador inválido" });
    }
    const trabajador = await Trabajador.findById(id);
    if (!trabajador) {
      return res.status(404).json({ mensaje: "Trabajador no encontrado" });
    }
    return res.status(200).json({ trabajador });
  } catch (error) {
    return errorServidor(res, error);
  }
};

const actualizarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID de trabajador inválido" });
    }
    const campos = Object.keys(req.body);
    if (!campos.length || campos.some((campo) => !["nombre", "whatsapp", "activo"].includes(campo))) {
      return res.status(400).json({ mensaje: "Indica campos válidos para actualizar" });
    }
    const { nombre, whatsapp, activo } = req.body;
    if ((nombre !== undefined && nombreInvalido(nombre)) ||
        whatsappInvalido(whatsapp) ||
        (activo !== undefined && typeof activo !== "boolean")) {
      return res.status(400).json({ mensaje: "Datos de actualización no válidos" });
    }
    const trabajador = await Trabajador.findById(id);
    if (!trabajador) {
      return res.status(404).json({ mensaje: "Trabajador no encontrado" });
    }
    if (nombre !== undefined) trabajador.nombre = nombre;
    if (whatsapp !== undefined) trabajador.whatsapp = whatsapp;
    if (activo !== undefined) trabajador.activo = activo;
    await trabajador.save();
    return res.status(200).json({ mensaje: "Trabajador actualizado", trabajador });
  } catch (error) {
    return errorServidor(res, error);
  }
};

const obtenerTrabajosDelTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID de trabajador inválido" });
    }
    const trabajador = await Trabajador.findById(id);
    if (!trabajador) {
      return res.status(404).json({ mensaje: "Trabajador no encontrado" });
    }
    const trabajos = await Trabajo.find({
      $or: [{ trabajador: id }, { responsableTemple: id }],
    }).sort({ fechaInicio: 1 });
    return res.status(200).json({ trabajador, trabajos });
  } catch (error) {
    return errorServidor(res, error);
  }
};

module.exports = {
  crearTrabajador,
  obtenerTrabajadores,
  buscarTrabajador,
  actualizarTrabajador,
  obtenerTrabajosDelTrabajador,
};
