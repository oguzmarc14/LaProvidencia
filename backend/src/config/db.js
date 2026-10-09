const mongoose = require("mongoose");

const conectarBD = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("A chambear semis, ya jalo la BD");
  } catch (error) {
    console.log("Aun no estamos listos pa chambear semis");
    console.error("Error completo:", error);
    process.exit(1);
}
};

module.exports = conectarBD;
