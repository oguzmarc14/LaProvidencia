const mongoose = require("mongoose");

// Versiones inmutables: cada cambio conserva el autor, motivo y vigencia.
const schema = new mongoose.Schema({
  trabajador: { type: mongoose.Schema.Types.ObjectId, ref: "Trabajador", default: null },
  tipo: { type: String, enum: ["horario", "festivo", "no_laborable", "laborable", "justificado"], required: true },
  desde: { type: String, required: true },
  hasta: { type: String, default: null },
  dias: [{ dia: Number, entrada: String, salida: String, _id: false }],
  tolerancia: { type: Number, min: 0, max: 180, default: 0 },
  motivo: { type: String, required: true, maxlength: 500 },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
}, { timestamps: true });
schema.index({ trabajador: 1, desde: 1, createdAt: -1 });
module.exports = mongoose.model("PlanAsistencia", schema);
