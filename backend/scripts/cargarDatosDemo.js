const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Trabajador = require("../src/models/Trabajador");
const Cliente = require("../src/models/Clientes");
const Trabajo = require("../src/models/Trabajo");
const Tarea = require("../src/models/Tarea");
const Venta = require("../src/models/RegistroVenta");
const Asistencia = require("../src/models/Asistencia");
const Usuario = require("../src/models/Usuario");
const { Producto } = require("../src/models/Catalogo");
const { zona, fechaLocal } = require("../src/utils/asistencia");

const id = numero => new mongoose.Types.ObjectId(numero.toString(16).padStart(24, "0"));

async function cargar() {
  const clave = process.env.CLAVE_DEMO;
  if (!clave || Buffer.byteLength(clave) < 12 || Buffer.byteLength(clave) > 72) {
    throw new Error("Configura CLAVE_DEMO con 12 a 72 bytes.");
  }

  const fecha = fechaLocal();
  const inicio = new Date(fecha + "T14:00:00Z");
  const entrega = new Date(inicio.getTime() + 7 * 86400000);
  const llegada = new Date(inicio.getTime() - 86400000);
  const salida = new Date(llegada.getTime() + 8 * 3600000);
  const hash = await bcrypt.hash(clave, 12);
  const datos = [
    [Trabajador, 1, { nombre: "Lucía Márquez", puesto: "Instaladora" }],
    [Cliente, 2, { nombre: "Sofía Herrera" }],
    [Trabajo, 3, { nombre: "Cubierta para cocina", material: "granito", fechaInicio: inicio, fechaFinal: entrega, estado: "fabricacion", trabajador: id(1), cliente: id(2) }],
    [Tarea, 4, { titulo: "Revisar medidas de cubierta", descripcion: "Verificar dimensiones y ubicación del fregadero.", trabajador: id(1), trabajo: id(3), fechaInicio: inicio, fechaLimite: entrega }],
    [Venta, 5, { fechaVenta: inicio, fechaEntrega: entrega, vendedor: "Daniel Cruz", trabajador: id(1), nombreCliente: "Sofía Herrera", modeloLapida: "Placa rectangular", materialLapida: "Granito", nombreDifunto: "Elena Herrera", precioTotal: 3200, anticipo: 1200 }],
    [Asistencia, 6, { trabajador: id(1), fecha: fechaLocal(llegada), llegada, salida, latitud: zona.latitud, longitud: zona.longitud, precision: 15, distanciaMetros: 0 }],
    [Producto, 7, { nombre: "Granito gris pulido", categoria: "Granito", precio: 1450, unidad: "m²", estado: "borrador" }],
    [Usuario, 8, { email: "daniel@laprovidencia", password: hash, rol: "admin" }],
    [Usuario, 9, { email: "lucia@laprovidencia", password: hash, rol: "usuario", trabajador: id(1) }],
  ];
  for (const [Modelo, numero, valores] of datos) {
    await new Modelo({ _id: id(numero), ...valores }).validate();
  }
  if (process.argv.includes("--validar")) {
    console.log("Documentos validados para la base local.");
    return;
  }
  await mongoose.connect("mongodb://127.0.0.1:27017/laprovidencia_demo", { serverSelectionTimeoutMS: 5000 });
  for (const [Modelo, numero, valores] of datos) {
    await Modelo.updateOne({ _id: id(numero) }, { $setOnInsert: valores }, { upsert: true, runValidators: true });
  }
  console.log("Registros disponibles en laprovidencia_demo.");
}

cargar().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
