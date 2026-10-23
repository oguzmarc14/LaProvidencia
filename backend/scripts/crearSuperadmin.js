require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Usuario = require("../src/models/Usuario");

const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const crearSuperadmin = async () => {
  const email = (process.env.ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGO_URI) throw new Error("Configura MONGO_URI antes de continuar");
  if (email !== "admin@gmail.com" || !correoValido.test(email)) {
    throw new Error("El superadmin inicial debe usar admin@gmail.com");
  }
  if (!password || password.length > 128 || (password !== "admin" && password.length < 12)) {
    throw new Error("ADMIN_PASSWORD debe ser 'admin' para el primer inicio o tener al menos 12 caracteres");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existente = await Usuario.exists({ rol: "superadmin" });
  if (existente) throw new Error("Ya existe un superadmin; no se creó ninguna cuenta");

  const hash = await bcrypt.hash(password, 12);
  await Usuario.create({
    email,
    password: hash,
    rol: "superadmin",
    debeCambiarContrasena: password === "admin",
  });
  console.log(`Superadmin creado: ${email}`);
};

crearSuperadmin()
  .catch((error) => {
    console.error(`No se pudo crear el superadmin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
