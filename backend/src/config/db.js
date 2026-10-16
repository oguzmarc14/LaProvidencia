const mongoose = require("mongoose");

const conectarBD = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("A chambear semis, ya jalo la BD");
  } catch (error) {
    console.error("Error:", error.message);

    if (error.reason?.servers) {
      for (const [servidor, info] of error.reason.servers) {
        console.log("Servidor:", servidor);
        console.log("Estado:", info.type);
        console.log("Causa:", info.error?.message || "No especificada");
      }
    }

    process.exit(1);
  }
};

module.exports = conectarBD;
