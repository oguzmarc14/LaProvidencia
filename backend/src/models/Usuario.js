const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    usuario: { type: String, trim: true },
    password: {
      type: String,
      required: true,
      select: false,
    },
    rol: {
      type: String,
      enum: ["superadmin", "admin", "usuario"],
      default: "usuario",
      required: true,
    },
    debeCambiarContrasena: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Usuario", usuarioSchema);
