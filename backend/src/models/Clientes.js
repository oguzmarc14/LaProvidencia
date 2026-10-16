const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  whatsapp: { type: String, default: "", trim: true },
  direccion: { type: String, default: "", trim: true },
  ubicacionMaps: { type: String, default: "", trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Clientes", clienteSchema);
