process.env.JWT_SECRET ||= "test-secret-with-at-least-32-characters-long";

const { test, before, after, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Usuario = require("../src/models/Usuario");
const Trabajador = require("../src/models/Trabajador");
const Asistencia = require("../src/models/Asistencia");
const Trabajo = require("../src/models/Trabajo");
const Tarea = require("../src/models/Tarea");
const RegistroVenta = require("../src/models/RegistroVenta");
const { zona, fechaLocal } = require("../src/utils/asistencia");

const cuenta = "507f1f77bcf86cd799439011";
const trabajador = "507f1f77bcf86cd799439012";
const otraFicha = "507f1f77bcf86cd799439013";
let servidor;
let base;

before(async () => {
  servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  base = "http://127.0.0.1:" + servidor.address().port + "/api";
});
after(() => new Promise(resolve => servidor.close(resolve)));
afterEach(() => mock.restoreAll());

function vincular(campos = {}) {
  mock.method(Usuario, "findById", () => ({
    select: async () => ({ _id: cuenta, rol: "usuario", trabajador, ...campos }),
  }));
  mock.method(Trabajador, "exists", async (filtro) => {
    assert.deepEqual(filtro, { _id: trabajador, activo: true });
    return { _id: trabajador };
  });
}

function solicitar(ruta, opciones = {}) {
  const token = jwt.sign({ sub: cuenta }, process.env.JWT_SECRET);
  return fetch(base + ruta, {
    ...opciones,
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
  });
}

function comprobarConsulta(Modelo, filtroEsperado, datos) {
  mock.method(Modelo, "find", (filtro) => {
    assert.deepEqual(filtro, filtroEsperado);
    return {
      select(campos) {
        const visibles = new Set(campos.split(" "));
        assert.ok(!["precioTotal", "anticipo", "saldoPendiente", "telefonoCliente", "cliente"].some(c => visibles.has(c)));
        return {
          sort: () => ({
            lean: async () => [Object.fromEntries(Object.entries(datos).filter(([campo]) => visibles.has(campo)))],
          }),
        };
      },
    };
  });
}

test("el portal filtra asignaciones por la ficha de sesión y no devuelve información financiera", async () => {
  vincular();
  comprobarConsulta(Trabajo, { $or: [{ trabajador }, { responsableTemple: trabajador }] },
    { nombre: "Instalación", precioTotal: 2500 });
  comprobarConsulta(Tarea, { trabajador }, { titulo: "Medir", descripcion: "Revisar espacio" });
  comprobarConsulta(RegistroVenta, { trabajador, gaveta: { $exists: true, $nin: ["", null] } },
    { gaveta: "14", pasillo: "A", precioTotal: 1000, anticipo: 100, saldoPendiente: 900 });
  const respuesta = await solicitar("/mi-trabajo?trabajador=" + otraFicha);
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), {
    trabajos: [{ nombre: "Instalación" }],
    tareas: [{ titulo: "Medir", descripcion: "Revisar espacio" }],
    gavetas: [{ gaveta: "14", pasillo: "A" }],
  });
});

test("la cuenta de trabajador no puede usar los endpoints administrativos ni editar asignaciones", async () => {
  vincular();
  for (const ruta of ["/trabajos", "/clientes", "/trabajadores", "/dashboard/resumen", "/registro-ventas", "/tareas", "/auth/users"]) {
    assert.equal((await solicitar(ruta)).status, 403, ruta);
  }
  assert.equal((await solicitar("/mi-trabajo", { method: "POST" })).status, 404);
});

test("una ficha sin vincular o inactiva no accede al portal ni a asistencia", async () => {
  vincular({ trabajador: null });
  assert.equal((await solicitar("/mi-trabajo")).status, 403);
  assert.equal((await solicitar("/asistencias/hoy")).status, 403);
  mock.restoreAll();
  vincular();
  mock.method(Trabajador, "exists", async () => null);
  assert.equal((await solicitar("/mi-trabajo")).status, 403);
  assert.equal((await solicitar("/asistencias/zona")).status, 403);
  assert.equal((await solicitar("/asistencias/salida", { method: "POST" })).status, 403);
});

test("la asistencia usa la ficha autenticada aunque el cuerpo incluya otro trabajador", async () => {
  vincular();
  mock.method(Trabajador, "findById", async (id) => {
    assert.equal(id, trabajador);
    return { activo: true };
  });
  mock.method(Asistencia, "create", async (datos) => {
    assert.equal(datos.trabajador, trabajador);
    return datos;
  });
  mock.method(Asistencia, "find", (filtro) => {
    assert.deepEqual(filtro, { fecha: fechaLocal(), trabajador });
    return { select: () => ({ populate: () => ({ sort: async () => [] }) }) };
  });
  const registro = await solicitar("/asistencias", {
    method: "POST",
    body: JSON.stringify({
      trabajador: otraFicha, latitud: zona.latitud, longitud: zona.longitud, precision: 10, tomadaEn: Date.now(),
    }),
  });
  assert.equal(registro.status, 201);
  mock.method(Asistencia, "findOneAndUpdate", async (filtro, cambios) => {
    assert.equal(filtro.trabajador, trabajador);
    return { trabajador, salida: cambios.$set.salida };
  });
  const salida = await solicitar("/asistencias/salida/", {
    method: "POST",
    body: JSON.stringify({
      trabajador: otraFicha, latitud: zona.latitud, longitud: zona.longitud, precision: 10, tomadaEn: Date.now(),
    }),
  });
  assert.equal(salida.status, 200);
  assert.equal((await salida.json()).asistencia.trabajador, trabajador);
  assert.equal((await solicitar("/asistencias/hoy?trabajador=" + otraFicha)).status, 200);
});

test("un cambio de contraseña invalida los tokens de la versión anterior", async () => {
  vincular({ versionSesion: 1 });
  assert.equal((await solicitar("/auth/me")).status, 401);
});

test("el historial personal limita semana y mes a la ficha autenticada", async () => {
  vincular();
  for (const [periodo, desde, hasta] of [
    ["semana", "2025-02-24", "2025-03-02"],
    ["mes", "2025-02-01", "2025-02-28"],
  ]) {
    comprobarConsulta(Asistencia, { trabajador, fecha: { $gte: desde, $lte: hasta } }, {
      fecha: "2025-02-26", llegada: "2025-02-26T15:00:00Z", latitud: 21,
    });
    const respuesta = await solicitar(`/asistencias/mis-registros?periodo=${periodo}&fecha=2025-02-26&trabajador=${otraFicha}`);
    assert.equal(respuesta.status, 200);
    const datos = await respuesta.json();
    assert.equal(datos.desde, desde);
    assert.equal(datos.hasta, hasta);
    assert.equal(datos.asistencias.length, 1);
    assert.equal(datos.asistencias[0].latitud, undefined);
    Asistencia.find.mock.restore();
  }
  assert.equal((await solicitar("/asistencias/mis-registros?fecha=2025-02-30")).status, 400);
});

test("solo administración puede eliminar un producto existente", async () => {
  const { Producto } = require("../src/models/Catalogo");
  vincular();
  assert.equal((await solicitar(`/catalogo/admin/productos/${otraFicha}`, { method: "DELETE" })).status, 403);
  Usuario.findById.mock.restore();
  vincular({ rol: "admin" });
  const eliminar = mock.method(Producto, "deleteOne", async filtro => {
    assert.deepEqual(filtro, { _id: otraFicha });
    return { deletedCount: eliminar.mock.callCount() === 0 ? 1 : 0 };
  });
  assert.equal((await solicitar("/catalogo/admin/productos/invalido", { method: "DELETE" })).status, 400);
  assert.equal((await solicitar(`/catalogo/admin/productos/${otraFicha}`, { method: "DELETE" })).status, 200);
  assert.equal((await solicitar(`/catalogo/admin/productos/${otraFicha}`, { method: "DELETE" })).status, 404);
});
