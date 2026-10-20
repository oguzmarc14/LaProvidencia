const express = require("express");
const { crearClientes, obtenerClientes, buscarClientes, actualizarClientes, eliminarCliente } = require("../controllers/clientesController")


const router = express.Router()


router.post("/", crearClientes)
router.get("/", obtenerClientes) 
router.get("/:id", buscarClientes)
router.patch("/:id", actualizarClientes)
router.delete("/:id", eliminarCliente)

module.exports = router

