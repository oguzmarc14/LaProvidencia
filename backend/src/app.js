const express = require("express");
const trabajoRoutes = require("./routes/trabajoRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const app = express();

app.use(express.json());
app.use("/api/trabajos", trabajoRoutes);
app.use("/api/clientes", clientesRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "la api esta funcionando :)",
  });
});

module.exports = app;
