const Cliente = require("../models/Clientes");

const crearCliente = async (req, res) => {
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
    if(error.name === "ValidationError"){
      res.status(400).json({
        mensaje: "Datos agregados incorrectamente"
      })
      return
    }

    console.error(error);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

const obtenerClientes = async (req, res) => {
 
  try{
    const clientes = await Cliente.find();

    res.status(200).json({
      clientes
    })
  }

  catch(error){
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener clientes"
    });
  }


}

module.exports = { crearCliente, obtenerClientes };
