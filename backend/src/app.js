const express = require("express");
const cors = require("cors");
const trabajoRoutes = require("./routes/trabajoRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const trabajadoresRoutes = require("./routes/trabajadoresRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const asistenciasRoutes = require("./routes/asistenciasRoutes");
const registroVentasRoutes = require("./routes/registroVentasRoutes");
const tareasRoutes = require("./routes/tareasRoutes");
const authRoutes = require("./routes/authRoutes");
const { autenticar } = require("./middleware/autenticacion");
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173,https://laprovidencia-marco.vercel.app").split(",").map((url) => url.trim()),
  }),
);

//aqui vamos a usar las apis de trabajos
app.use("/api/auth", authRoutes);
app.use("/api/trabajos", autenticar, trabajoRoutes);

//espacios para apis de clientes
app.use("/api/clientes", autenticar, clientesRoutes);


app.use("/api/trabajadores", autenticar, trabajadoresRoutes);
app.use("/api/dashboard", autenticar, dashboardRoutes);
app.use("/api/asistencias", autenticar, asistenciasRoutes);
app.use("/api/registro-ventas", autenticar, registroVentasRoutes);
app.use("/api/tareas", autenticar, tareasRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "la api esta funcionando :)",
  });
});

module.exports = app;
