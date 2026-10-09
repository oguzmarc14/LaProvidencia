const Trabajo = require("../models/Trabajo");

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

  if (!/^[a-fA-F0-9]{24}$/.test(id || "")) {
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

module.exports = { crearTrabajo, eliminarTrabajo };
