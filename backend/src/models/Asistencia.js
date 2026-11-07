const mongoose = require("mongoose");

const asistenciaSchema = new mongoose.Schema({
  trabajador: { type: mongoose.Schema.Types.ObjectId, ref: "Trabajador", required: true },
  fecha: { type: String, required: true },
  llegada: { type: Date, required: true },
  latitud: { type: Number, required: true, min: -90, max: 90 },
  longitud: { type: Number, required: true, min: -180, max: 180 },
  precision: { type: Number, required: true, min: 0 },
  distanciaMetros: { type: Number, required: true, min: 0 },
});

// El índice impide duplicados incluso ante dos solicitudes simultáneas.
asistenciaSchema.index({ trabajador: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model("Asistencia", asistenciaSchema);
