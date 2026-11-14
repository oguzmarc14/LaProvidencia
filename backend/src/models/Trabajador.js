const mongoose = require("mongoose");

const trabajadorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    puesto: { type: String, trim: true, maxlength: 20, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trabajador", trabajadorSchema);
