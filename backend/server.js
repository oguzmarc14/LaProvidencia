require("dotenv").config();

const app = require("./src/app");
const conectarBD = require("./src/config/db");
const Asistencia = require("./src/models/Asistencia");

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET debe configurarse con al menos 32 caracteres");
  }
  await conectarBD();
  await Asistencia.init();

  app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
  });
};

iniciarServidor();
