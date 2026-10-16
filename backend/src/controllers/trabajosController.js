const mongoose = require("mongoose");
const Trabajo = require("../models/Trabajo");
const Trabajador = require("../models/Trabajador");
const Clientes = require("../models/Clientes");

const relaciones = [{ path: "cliente", select: "nombre whatsapp" }, { path: "trabajador", select: "nombre activo" }, { path: "responsableTemple", select: "nombre activo" }];
const idValido = (id) => mongoose.isValidObjectId(id);
const errorServidor = (res, error) => { console.error(error); return res.status(500).json({ mensaje: "Error en el servidor" }); };

async function validarDatos(datos) {
  if (typeof datos.nombre !== "string" || !datos.nombre.trim()) return "El nombre es obligatorio";
  if (!["granito", "vidrio"].includes(datos.material)) return "Selecciona un material válido";
  if (!datos.fechaInicio || !datos.fechaFinal || Number.isNaN(Date.parse(datos.fechaInicio)) || Number.isNaN(Date.parse(datos.fechaFinal))) return "Las fechas son obligatorias y deben ser válidas";
  if (new Date(datos.fechaFinal) < new Date(datos.fechaInicio)) return "La fecha final no puede ser anterior a la inicial";
  if (datos.direccionInstalacion !== undefined && typeof datos.direccionInstalacion !== "string") return "La dirección de instalación no es válida";
  if (datos.ubicacionMaps !== undefined) {
    if (typeof datos.ubicacionMaps !== "string") return "La ubicación de Google Maps no es válida";
    if (datos.ubicacionMaps.trim()) {
      try {
        const url = new URL(datos.ubicacionMaps.trim());
        const host = url.hostname.toLowerCase();
        if (url.protocol !== "https:" || !(
          host === "maps.app.goo.gl" || host === "goo.gl" || host === "maps.google.com" ||
          host === "www.google.com" || host === "google.com" ||
          /^maps\\.google\\.[a-z.]+$/.test(host) || /^www\\.google\\.[a-z.]+$/.test(host)
        )) return "Pega un enlace HTTPS válido de Google Maps";
      } catch { return "Pega un enlace HTTPS válido de Google Maps"; }
    }
  }
  if (datos.estado && !["templado", "fabricacion", "detallado", "instalacion", "finalizado"].includes(datos.estado)) return "Estado no válido";
  for (const campo of ["cliente", "trabajador", "responsableTemple"]) {
    if (datos[campo] && !idValido(datos[campo])) return `El ID de ${campo} no es válido`;
  }
  if (datos.cliente && !(await Clientes.exists({ _id: datos.cliente }))) return "El cliente seleccionado no existe";
  for (const campo of ["trabajador", "responsableTemple"]) {
    if (datos[campo] && !(await Trabajador.exists({ _id: datos[campo], activo: true }))) return `El ${campo} seleccionado no existe o está inactivo`;
  }
  return null;
}

const obtenerTrabajos = async (_req, res) => {
  try {
    const trabajos = await Trabajo.find().populate(relaciones).sort({ fechaInicio: -1, _id: -1 });
    return res.json({ trabajos });
  } catch (error) { return errorServidor(res, error); }
};

const obtenerTrabajo = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "ID no válido" });
  try {
    const trabajo = await Trabajo.findById(req.params.id).populate(relaciones);
    if (!trabajo) return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    return res.json({ trabajo });
  } catch (error) { return errorServidor(res, error); }
};

const crearTrabajo = async (req, res) => {
  try {
    const datos = req.body || {};
    const mensaje = await validarDatos(datos);
    if (mensaje) return res.status(400).json({ mensaje });
    const trabajo = await Trabajo.create(datos);
    await trabajo.populate(relaciones);
    return res.status(201).json({ mensaje: "Trabajo creado correctamente", trabajo });
  } catch (error) {
    if (["ValidationError", "CastError"].includes(error.name)) return res.status(400).json({ mensaje: error.message });
    return errorServidor(res, error);
  }
};

const actualizarTrabajo = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "ID no válido" });
  try {
    const trabajo = await Trabajo.findById(req.params.id);
    if (!trabajo) return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    const campos = ["nombre", "material", "especificaciones", "fechaInicio", "fechaFinal", "estado", "trabajador", "responsableTemple", "cliente", "direccionInstalacion", "ubicacionMaps"];
    const datos = Object.fromEntries(campos.filter(c => Object.prototype.hasOwnProperty.call(req.body || {}, c)).map(c => [c, req.body[c] === "" && ["trabajador", "responsableTemple", "cliente"].includes(c) ? null : req.body[c]]));
    const mensaje = await validarDatos({ ...trabajo.toObject(), ...datos });
    if (mensaje) return res.status(400).json({ mensaje });
    Object.assign(trabajo, datos);
    await trabajo.save();
    await trabajo.populate(relaciones);
    return res.json({ mensaje: "Trabajo actualizado correctamente", trabajo });
  } catch (error) {
    if (["ValidationError", "CastError"].includes(error.name)) return res.status(400).json({ mensaje: error.message });
    return errorServidor(res, error);
  }
};

const eliminarTrabajo = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "ID no válido" });
  try {
    const trabajo = await Trabajo.findByIdAndDelete(req.params.id);
    if (!trabajo) return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    return res.json({ mensaje: "Trabajo eliminado correctamente" });
  } catch (error) { return errorServidor(res, error); }
};

module.exports = { obtenerTrabajos, obtenerTrabajo, crearTrabajo, actualizarTrabajo, eliminarTrabajo };
