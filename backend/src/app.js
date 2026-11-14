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
const miTrabajoRoutes = require("./routes/miTrabajoRoutes");
const catalogoRoutes = require("./routes/catalogoRoutes");
const { autenticar, soloAdmin, soloTrabajadorActivo, adminOTrabajadorActivo } = require("./middleware/autenticacion");
const app = express();

const json = express.json();
const origenesFrontend = (process.env.FRONTEND_URL || "http://localhost:5173,https://laprovidencia-marco.vercel.app")
  .split(",")
  .map(url => url.trim());
origenesFrontend.push("https://marmolesygranitoslaprovidencia.vercel.app");

app.use(
  cors({
    origin: origenesFrontend,
  }),
);

app.use("/api/catalogo", catalogoRoutes);
app.use(["/api/trabajos", "/api/registro-ventas"], express.json({ limit: "2mb" }));
app.use(json);

//aqui vamos a usar las apis de trabajos
app.use("/api/calendario", autenticar, soloAdmin, require("./routes/calendarioRoutes"));
app.use("/api/auth", authRoutes);
app.use("/api/trabajos", autenticar, soloAdmin, trabajoRoutes);

//espacios para apis de clientes
app.use("/api/clientes", autenticar, soloAdmin, clientesRoutes);

app.use("/api/trabajadores", autenticar, soloAdmin, trabajadoresRoutes);
app.use("/api/dashboard", autenticar, soloAdmin, dashboardRoutes);
app.use("/api/asistencias", autenticar, adminOTrabajadorActivo, asistenciasRoutes);
app.use("/api/registro-ventas", autenticar, soloAdmin, registroVentasRoutes);
app.use("/api/tareas", autenticar, soloAdmin, tareasRoutes);
app.use("/api/mi-trabajo", autenticar, soloTrabajadorActivo, miTrabajoRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "la api esta funcionando :)",
  });
});

module.exports = app;
