const express = require("express");
const { crearCliente } = require("../controllers/clientesController")

const router = express.Router()


router.post("/", crearCliente)

module.exports = router

