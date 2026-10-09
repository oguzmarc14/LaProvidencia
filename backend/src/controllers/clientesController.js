const mongoose = require("mongoose");
const Cliente = require("../models/Clientes");

const crearClientes = async (req, res) => {
  const nombre = req.body.nombre;
  const whatsapp = req.body.whatsapp;
  const direccion = req.body.direccion;

  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    res.status(400).json({
      mensaje: "Verifica el nombre a ingresar",
    });
    return;
  }

  try {
    const nuevoCliente = await Cliente.create({ nombre, whatsapp, direccion });

    res.status(201).json({
      mensaje: "Cliente creado correctamente",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400).json({
        mensaje: "Datos agregados incorrectamente",
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();

    res.status(200).json({
      clientes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener clientes",
    });
  }
};

const buscarClientes = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "ID del cliente invalido",
      });
    }

    const cliente = await Cliente.findById(id);

    if (cliente) {
      return res.status(200).json({
        cliente,
      });
    } else {
      res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrio un error inesperado",
    });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const { nombre, whatsapp, direccion } = req.body;
    const datos = { nombre, whatsapp, direccion };

    for (const [campo, valor] of Object.entries(datos)) {
      if (typeof valor !== "string" || !valor.trim()) {
        return res.status(400).json({
          mensaje: `El campo ${campo} es obligatorio`
        });
      }
      datos[campo] = valor.trim();
    }

    const cliente = await Cliente.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    return res.status(200).json({ cliente });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al actualizar cliente" });
  }
};

module.exports = { crearClientes, obtenerClientes, buscarClientes };
