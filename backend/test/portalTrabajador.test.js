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
        assert.ok(!["anticipo", "saldoPendiente", "telefonoCliente", "cliente", "nombreCliente", "vendedor", "observaciones"].some(c => visibles.has(c)));
        assert.equal(visibles.has("precioTotal"), Modelo === RegistroVenta);
        return {
          sort: () => ({
            lean: async () => [Object.fromEntries(Object.entries(datos).filter(([campo]) => visibles.has(campo)))],
          }),
        };
      },
    };
  });
}

test("el portal filtra por la ficha de sesión y muestra solo el precio de las lápidas, incluso sin gaveta", async () => {
  vincular();
  comprobarConsulta(Trabajo, { $or: [{ trabajador }, { responsableTemple: trabajador }] },
    { nombre: "Instalación", precioTotal: 2500 });
  comprobarConsulta(Tarea, { trabajador }, { titulo: "Medir", descripcion: "Revisar espacio" });
  comprobarConsulta(RegistroVenta, { trabajador },
    { modeloLapida: "120", pasillo: "A", precioTotal: 1000, anticipo: 100, saldoPendiente: 900, nombreCliente: "Privado", telefonoCliente: "4491234567" });
  const respuesta = await solicitar("/mi-trabajo?trabajador=" + otraFicha);
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), {
    trabajos: [{ nombre: "Instalación" }],
    tareas: [{ titulo: "Medir", descripcion: "Revisar espacio" }],
    gavetas: [{ modeloLapida: "120", pasillo: "A", precioTotal: 1000 }],
  });
});

test("la cuenta de trabajador no puede usar los endpoints administrativos ni editar asignaciones", async () => {
  vincular();
  for (const ruta of ["/trabajos", "/clientes", "/trabajadores", "/dashboard/resumen", "/registro-ventas", "/tareas", "/auth/users", "/asistencias/historial", "/asistencias/historial?fecha=2026-10-23"]) {
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
