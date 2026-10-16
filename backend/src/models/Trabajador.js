const mongoose = require("mongoose");

const trabajadorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true, default: "" },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trabajador", trabajadorSchema);
