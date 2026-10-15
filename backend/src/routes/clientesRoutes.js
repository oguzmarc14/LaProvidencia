const express = require("express");
const { crearClientes, obtenerClientes, buscarClientes, actualizarClientes } = require("../controllers/clientesController")


const router = express.Router()


router.post("/", crearClientes)
router.get("/", obtenerClientes) 
router.get("/:id", buscarClientes)
router.patch("/:id", actualizarClientes)

module.exports = router

