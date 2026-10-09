const express = require("express");
const { crearClientes, obtenerClientes, buscarClientes } = require("../controllers/clientesController")


const router = express.Router()


router.post("/", crearClientes)
router.get("/", obtenerClientes) 
router.get("/", buscarClientes)

module.exports = router

