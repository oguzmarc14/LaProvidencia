require("dotenv").config();

const app = require("./src/app");
const conectarBD = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  await conectarBD();

  app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
  });
};

iniciarServidor();
