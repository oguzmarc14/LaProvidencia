const { Schema, model } = require("mongoose");

const categorias = [
  "Pisos", "Accesorios de baño", "Canceles y mamparas", "Espejos",
  "Cubiertas y barras", "Vidrio", "Granito", "Lápidas", "Otros",
  "Mármoles", "Cuarzos", "Cuarcitas", "Porcelanatos", "Fachaletas", "Canteras", "Lajas",
  "Tarjas", "Llaves o monomandos", "Campanas", "Parrillas", "Ovalines", "Monomandos para baño",
];
const unidades = ["pieza", "metro lineal", "m²"];
const estados = ["borrador", "publicado", "oculto"];
const imagenValida = (valor) => {
  const partes = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(valor);
  if (!partes || partes[2].length % 4 || partes[2].length > 546136) return false;
  const bytes = Buffer.from(partes[2], "base64");
  if (bytes.length > 400 * 1024) return false;
  if (partes[1] === "jpeg") return bytes.subarray(0, 3).toString("hex") === "ffd8ff";
  if (partes[1] === "png") return bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
  return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
};

const Producto = model("ProductoCatalogo", new Schema({
  nombre: { type: String, trim: true, required: true, maxlength: 100 },
  categoria: { type: String, enum: categorias, required: true },
  caracteristicas: { type: String, trim: true, maxlength: 1500, default: "" },
  medidas: { type: String, trim: true, maxlength: 120, default: "" },
  material: { type: String, trim: true, maxlength: 100, default: "" },
  presentacion: { type: String, trim: true, maxlength: 100, default: "" },
  acabados: { type: String, trim: true, maxlength: 200, default: "" },
  precioDesde: { type: Boolean, default: false },
  precio: { type: Number, required: true, min: 0, max: 10000000 },
  unidad: { type: String, enum: unidades, required: true },
  estado: { type: String, enum: estados, default: "borrador" },
  imagenes: { type: [String], validate: (imagenes) => imagenes.length <= 3 && imagenes.every(imagenValida) },
}, { timestamps: true }));

const Acceso = model("AccesoCatalogo", new Schema({
  _id: String,
  whatsapp: { type: String, default: "" },
}));

module.exports = { Producto, Acceso };
