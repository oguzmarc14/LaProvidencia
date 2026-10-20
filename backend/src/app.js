const express = require("express");
const cors = require("cors");
const trabajoRoutes = require("./routes/trabajoRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const trabajadoresRoutes = require("./routes/trabajadoresRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const registroVentasRoutes = require("./routes/registroVentasRoutes");
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

//aqui vamos a usar las apis de trabajos
app.use("/api/trabajos", trabajoRoutes);

//espacios para apis de clientes
app.use("/api/clientes", clientesRoutes);

app.use("/api/trabajadores", trabajadoresRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/registro-ventas", registroVentasRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "la api esta funcionando :)",
  });
});

module.exports = app;
