const Trabajo = require("../models/Trabajo");

const idValido = (id) => /^[a-fA-F0-9]{24}$/.test(id || "");

const obtenerTrabajos = async (req, res) => {
  try {
    const trabajos = await Trabajo.find();
    return res.status(200).json({ trabajos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

const obtenerTrabajo = async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ mensaje: "El ID del trabajo no es válido" });
  }

  try {
    const trabajo = await Trabajo.findById(req.params.id);
    if (!trabajo) {
      return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    }
    return res.status(200).json({ trabajo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

const actualizarTrabajo = async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ mensaje: "El ID del trabajo no es válido" });
  }

  const camposPermitidos = [
    "nombre", "material", "especificaciones", "fechaInicio", "fechaFinal",
    "estado", "trabajador", "responsableTemple", "cliente", "video",
  ];
  const datos = {};
  for (const campo of camposPermitidos) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, campo)) {
      datos[campo] = req.body[campo];
    }
  }

  if (Object.keys(datos).length === 0) {
    return res.status(400).json({ mensaje: "Envía al menos un campo del trabajo para actualizar" });
  }
  if (Object.prototype.hasOwnProperty.call(datos, "nombre") &&
      (typeof datos.nombre !== "string" || datos.nombre.trim() === "")) {
    return res.status(400).json({ mensaje: "Verifica el nombre a ingresar" });
  }

  try {
    const trabajo = await Trabajo.findByIdAndUpdate(
      req.params.id,
      { $set: datos },
      { new: true, runValidators: true },
    );
    if (!trabajo) {
      return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    }
    return res.status(200).json({ mensaje: "Trabajo actualizado correctamente", trabajo });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ mensaje: "Datos agregados incorrectamente" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

const crearTrabajo = async (req, res) => {
  const {
    nombre,
    material,
    especificaciones,
    fechaInicio,
    fechaFinal,
    estado,
    trabajador,
    responsableTemple,
    cliente,
    video,
  } = req.body || {};

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      mensaje: "Verifica el nombre a ingresar",
    });
  }

  try {
    const nuevoTrabajo = await Trabajo.create({
      nombre,
      material,
      especificaciones,
      fechaInicio,
      fechaFinal,
      estado,
      trabajador,
      responsableTemple,
      cliente,
      video,
    });

    return res.status(201).json({
      mensaje: "Trabajo creado correctamente",
      trabajo: nuevoTrabajo,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        mensaje: "Datos agregados incorrectamente",
      });
    }

    console.error(error);
    return res.status(500).json({
      mensaje: "Error en el servidor",
    });
  }
};

const eliminarTrabajo = async (req, res) => {
  const { id } = req.params;

  if (!idValido(id)) {
    return res.status(400).json({
      mensaje: "El ID del trabajo no es válido",
    });
  }

  try {
    const trabajo = await Trabajo.findByIdAndDelete(id);

    if (!trabajo) {
      return res.status(404).json({
        mensaje: "Trabajo no encontrado",
      });
    }

    return res.status(200).json({
      mensaje: "Trabajo eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error en el servidor",
    });
  }
};

module.exports = {
  crearTrabajo, obtenerTrabajos, obtenerTrabajo, actualizarTrabajo, eliminarTrabajo,
};
