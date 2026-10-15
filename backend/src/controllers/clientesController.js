//importacion de librerias
const mongoose = require("mongoose");
const Cliente = require("../models/Clientes");

//declaracion de funciones
const validarNombre = (nombre) => {
  return !nombre || typeof nombre !== "string" || nombre.trim() === "";
};

const validarCampoOpcional = (valor) => {
  return valor !== undefined && typeof valor !== "string";
};

const crearClientes = async (req, res) => {
  const nombre = req.body.nombre;
  const whatsapp = req.body.whatsapp;
  const direccion = req.body.direccion;

  if (validarNombre(nombre)) {
    res.status(400).json({
      mensaje: "Verifica el nombre a ingresar",
    });
    return;
  }

  try {
    const nuevoCliente = await Cliente.create({ nombre, whatsapp, direccion });

    res.status(201).json({
      mensaje: "Cliente creado correctamente",
      cliente: nuevoCliente,
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

const actualizarClientes = async (req, res) => {
  try {
    const id = req.params.id;

    const nombre = req.body.nombre;
    const whatsapp = req.body.whatsapp;
    const direccion = req.body.direccion;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "El id del cliente no es valido",
      });
    }

    const cliente = await Cliente.findById(id);
    console.log(cliente);

    if (!cliente) {
      return res.status(404).json({
        mensaje: "El cliente no existe",
      });
    }

    // 1. Validamos los datos recibidos

    if (nombre !== undefined && validarNombre(nombre)) {
      return res.status(400).json({
        mensaje: "El nombre ingresado no es válido",
      });
    }

    if (validarCampoOpcional(direccion)) {
      return res.status(400).json({
        mensaje: "La dirección no es válida",
      });
    }

    if (validarCampoOpcional(whatsapp)) {
      return res.status(400).json({
        mensaje: "El WhatsApp no es válido",
      });
    }

    // 2. Asignamos los nuevos valores

    if (nombre !== undefined) {
      cliente.nombre = nombre;
    }

    if (direccion !== undefined) {
      cliente.direccion = direccion;
    }

    if (whatsapp !== undefined) {
      cliente.whatsapp = whatsapp;
    }

    await cliente.save();

    res.status(200).json({
      mensaje: "Los datos fueron editados correctamente",
      cliente: cliente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Existe un error en el servidor",
    });
  }
};

module.exports = {
  crearClientes,
  obtenerClientes,
  buscarClientes,
  actualizarClientes,
};
