const express = require("express");
const { Producto, Acceso } = require("../models/Catalogo");
const { autenticar, soloAdmin } = require("../middleware/autenticacion");

const router = express.Router();
const admin = express.Router();
const accesoId = "catalogo";
const campos = "nombre categoria caracteristicas medidas precio unidad imagenes";

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
router.use(express.json({ limit: "2mb" }));
router.use("/admin", autenticar, soloAdmin, admin);

admin.get("/configuracion", async (req, res) => {
  const acceso = await Acceso.findById(accesoId).select("whatsapp").lean();
  res.json({ whatsapp: acceso?.whatsapp || "" });
});

admin.put("/configuracion", async (req, res) => {
  const { whatsapp } = req.body || {};
  if (typeof whatsapp !== "string" || !/^(?:[1-9]\d{7,14})?$/.test(whatsapp)) {
    return res.status(400).json({ mensaje: "Ingresa un WhatsApp con código de país, sin espacios." });
  }
  await Acceso.updateOne({ _id: accesoId }, { whatsapp }, { upsert: true });
  res.json({ whatsapp });
});

admin.get("/productos", async (req, res) => {
  res.json({ productos: await Producto.find().sort({ updatedAt: -1 }).lean() });
});

async function guardarProducto(req, res) {
  const { nombre, categoria, caracteristicas, medidas, precio, unidad, estado, imagenes } = req.body || {};
  if (![nombre, categoria, caracteristicas, medidas, unidad, estado].every((valor) => typeof valor === "string") ||
      typeof precio !== "number" || !Number.isFinite(precio) || !Array.isArray(imagenes) ||
      imagenes.some((imagen) => typeof imagen !== "string")) {
    return res.status(400).json({ mensaje: "Revisa el precio y las imágenes." });
  }
  if (estado === "publicado" && !imagenes.length) {
    return res.status(400).json({ mensaje: "Agrega al menos una foto antes de publicar." });
  }
  const datos = { nombre, categoria, caracteristicas, medidas, precio, unidad, estado, imagenes };
  const id = req.params.id;
  if (id && !/^[a-f0-9]{24}$/i.test(id)) return res.status(400).json({ mensaje: "Producto inválido." });
  try {
    const producto = id
      ? await Producto.findByIdAndUpdate(id, datos, { returnDocument: "after", runValidators: true })
      : await Producto.create(datos);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado." });
    res.status(id ? 200 : 201).json({ producto });
  } catch (error) {
    if (error.name !== "ValidationError") throw error;
    res.status(400).json({ mensaje: "Revisa los campos. Puedes subir hasta 3 fotos JPG, PNG o WebP de 400 KB cada una." });
  }
}
admin.post("/productos", guardarProducto);
admin.put("/productos/:id", guardarProducto);

router.get("/productos", async (req, res) => {
  const [productos, acceso] = await Promise.all([
    Producto.find({ estado: "publicado" }).select(campos).sort({ categoria: 1, nombre: 1 }).lean(),
    Acceso.findById(accesoId).select("whatsapp").lean(),
  ]);
  res.json({ productos, whatsapp: acceso?.whatsapp || "" });
});

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") {
    return res.status(413).json({ mensaje: "Las fotos superan el tamaño permitido." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "La solicitud no contiene JSON válido." });
  }
  console.error(error);
  res.status(500).json({ mensaje: "No se pudo completar la solicitud del catálogo." });
});

module.exports = router;
