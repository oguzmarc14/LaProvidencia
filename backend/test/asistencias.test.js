process.env.JWT_SECRET ||= "test-secret-with-at-least-32-characters-long";

const { test, before, after, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const Usuario = require("../src/models/Usuario");
const app = require("../src/app");
const Trabajador = require("../src/models/Trabajador");
const Asistencia = require("../src/models/Asistencia");
const { zona, fechaLocal, distanciaMetros } = require("../src/utils/asistencia");

const id = "507f1f77bcf86cd799439011";
const entrada = () => ({
  trabajador: id, latitud: zona.latitud, longitud: zona.longitud,
  precision: 10, tomadaEn: Date.now(),
});
let servidor;
let base;
before(async () => {
  servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  base = `http://127.0.0.1:${servidor.address().port}/api/asistencias`;
});
after(() => new Promise((resolve, reject) => servidor.close((error) => error ? reject(error) : resolve())));
afterEach(() => mock.restoreAll());
const token = jwt.sign({ sub: id }, process.env.JWT_SECRET);
const solicitar = (url, opciones = {}) => {
  mock.method(Usuario, "findById", () => ({
    select: async () => ({ _id: id, rol: "admin" }),
  }));
  return fetch(url, {
    ...opciones, headers: { ...opciones.headers, Authorization: `Bearer ${token}` },
  });
};
const post = (datos) => solicitar(base, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
});

test("zona fija de 100 metros y respuestas sin caché", async () => {
  const respuesta = await solicitar(`${base}/zona`);
  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.headers.get("cache-control"), "no-store");
  assert.deepEqual((await respuesta.json()).zona, zona);
  assert.equal(zona.radioMetros, 100);
});

test("checar guarda la hora del servidor y no acepta fecha u hora del cliente", async () => {
  mock.method(Trabajador, "findById", async (trabajador) => {
    assert.equal(trabajador, id);
    return { activo: true };
  });
  mock.method(Asistencia, "create", async (datos) => {
    assert.ok(Math.abs(datos.llegada.getTime() - Date.now()) < 2000);
    assert.equal(datos.fecha, fechaLocal(datos.llegada));
    assert.equal(datos.distanciaMetros, 0);
    assert.equal(datos.trabajador, id);
    return { _id: "registro", ...datos };
  });
  const respuesta = await post({ ...entrada(), fecha: "2000-01-01", llegada: "2000-01-01" });
  assert.equal(respuesta.status, 201);
  assert.equal((await respuesta.json()).asistencia._id, "registro");
});

test("rechaza coordenadas inválidas, ubicación vieja o poco precisa antes de consultar BD", async () => {
  mock.method(Trabajador, "findById", () => assert.fail("No debe consultar la BD"));
  for (const cambios of [
    { trabajador: "invalido" }, { trabajador: { $ne: null } },
    { latitud: null }, { latitud: "21.5" }, { latitud: 91 },
    { longitud: -181 }, { precision: -1 }, { precision: 101 },
    { tomadaEn: null }, { tomadaEn: Date.now() - 60000 }, { tomadaEn: Date.now() + 60000 },
  ]) {
    assert.equal((await post({ ...entrada(), ...cambios })).status, 400);
  }
  assert.equal((await post({})).status, 400);
});

test("valida el radio en el servidor aunque el cliente envíe una distancia falsa", async () => {
  mock.method(Trabajador, "findById", () => assert.fail("No debe consultar la BD"));
  const latitudA = zona.latitud + (99 / 6371000) * 180 / Math.PI;
  const latitudB = zona.latitud + (101 / 6371000) * 180 / Math.PI;
  assert.ok(distanciaMetros(latitudA, zona.longitud) < 100);
  assert.ok(distanciaMetros(latitudB, zona.longitud) > 100);
  assert.equal((await post({ ...entrada(), latitud: latitudB, distanciaMetros: 0, radioMetros: 10000 })).status, 403);
});

test("acepta una llegada justo dentro del radio", async () => {
  mock.method(Trabajador, "findById", async () => ({ activo: true }));
  mock.method(Asistencia, "create", async (datos) => datos);
  const latitud = zona.latitud + (99 / 6371000) * 180 / Math.PI;
  assert.equal((await post({ ...entrada(), latitud })).status, 201);
});

test("rechaza trabajadores inexistentes e inactivos", async () => {
  mock.method(Asistencia, "create", () => assert.fail("No debe guardar una llegada"));
  mock.method(Trabajador, "findById", async () => null);
  assert.equal((await post(entrada())).status, 404);
  mock.restoreAll();
  mock.method(Trabajador, "findById", async () => ({ activo: false }));
  assert.equal((await post(entrada())).status, 403);
});

test("el índice único trabajador/fecha convierte registros duplicados en 409", async () => {
  assert.ok(Asistencia.schema.indexes().some(([campos, opciones]) =>
    campos.trabajador === 1 && campos.fecha === 1 && opciones.unique));
  mock.method(Trabajador, "findById", async () => ({ activo: true }));
  mock.method(Asistencia, "create", async () => { throw Object.assign(new Error("Duplicado"), { code: 11000 }); });
  assert.equal((await post(entrada())).status, 409);
});

test("el día de asistencia cambia a medianoche de México y no a medianoche UTC", () => {
  assert.equal(fechaLocal(new Date("2026-10-23T05:59:59Z")), "2026-10-22");
  assert.equal(fechaLocal(new Date("2026-10-23T06:00:00Z")), "2026-10-23");
});

test("hoy consulta únicamente el día local y excluye coordenadas de la lista", async () => {
  mock.method(Asistencia, "find", (filtro) => {
    assert.deepEqual(filtro, { fecha: fechaLocal() });
    return {
      select(campos) { assert.equal(campos, "trabajador fecha llegada salida"); return this; },
      populate(modelo, campos) { assert.equal(modelo, "trabajador"); assert.equal(campos, "nombre"); return this; },
      sort(orden) { assert.deepEqual(orden, { llegada: -1 }); return Promise.resolve([]); },
    };
  });
  const respuesta = await solicitar(`${base}/hoy`);
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { fecha: fechaLocal(), asistencias: [] });
});

const postSalida = (datos) => solicitar(`${base}/salida`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
});

test("salida guarda la hora del servidor sin sobrescribir la entrada ni una salida existente", async () => {
  const llegada = new Date(Date.now() - 3600000);
  mock.method(Trabajador, "findById", async () => ({ activo: true }));
  mock.method(Asistencia, "findOneAndUpdate", async (filtro, cambios, opciones) => {
    assert.equal(filtro.trabajador, id);
    assert.equal(filtro.fecha, fechaLocal());
    assert.equal(filtro.salida, null);
    assert.ok(filtro.llegada.$lte instanceof Date);
    assert.deepEqual(Object.keys(cambios.$set), ["salida", "salidaPor", "salidaGPS"]);
    assert.equal(String(cambios.$set.salidaPor), id);
    assert.equal(cambios.$set.salidaGPS.latitud, zona.latitud);
    assert.ok(Math.abs(cambios.$set.salida.getTime() - Date.now()) < 2000);
    assert.equal(opciones.new, true);
    return { trabajador: id, llegada, salida: cambios.$set.salida };
  });
  const respuesta = await postSalida({ ...entrada(), salida: "2000-01-01" });
  assert.equal(respuesta.status, 200);
  const { asistencia } = await respuesta.json();
  assert.equal(asistencia.llegada, llegada.toISOString());
  assert.ok(new Date(asistencia.salida) > llegada);
});

test("salida rechaza ausencia de entrada y salida duplicada", async () => {
  mock.method(Trabajador, "findById", async () => ({ activo: true }));
  mock.method(Asistencia, "findOneAndUpdate", async () => null);
  mock.method(Asistencia, "exists", async () => null);
  const sinEntrada = await postSalida(entrada());
  assert.equal(sinEntrada.status, 409);
  assert.match((await sinEntrada.json()).mensaje, /Primero registra/);
  mock.restoreAll();
  mock.method(Trabajador, "findById", async () => ({ activo: true }));
  mock.method(Asistencia, "findOneAndUpdate", async () => null);
  mock.method(Asistencia, "exists", async () => ({ _id: id }));
  const duplicada = await postSalida(entrada());
  assert.equal(duplicada.status, 409);
  assert.match((await duplicada.json()).mensaje, /ya está registrada/);
});

test("salida exige ubicación reciente, precisa y dentro del radio", async () => {
  mock.method(Asistencia, "findOneAndUpdate", () => assert.fail("No debe actualizar"));
  assert.equal((await postSalida({})).status, 400);
  assert.equal((await postSalida({ ...entrada(), tomadaEn: Date.now() - 60000 })).status, 400);
  assert.equal((await postSalida({ ...entrada(), precision: 101 })).status, 400);
  assert.equal((await postSalida({ ...entrada(), latitud: zona.latitud + 1 })).status, 403);
});

test("salida rechaza trabajadores inexistentes e inactivos y controla fallos de BD", async () => {
  mock.method(Trabajador, "findById", async () => null);
  assert.equal((await postSalida(entrada())).status, 404);
  mock.restoreAll();
  mock.method(Trabajador, "findById", async () => ({ activo: false }));
  assert.equal((await postSalida(entrada())).status, 403);
  mock.restoreAll();
  mock.method(console, "error", () => {});
  mock.method(Trabajador, "findById", async () => ({ activo: true }));
  mock.method(Asistencia, "findOneAndUpdate", async () => { throw new Error("BD desconectada"); });
  const respuesta = await postSalida(entrada());
  assert.equal(respuesta.status, 500);
  assert.equal((await respuesta.json()).mensaje, "No se pudo registrar la salida");
});

test("fallos de BD devuelven 500 con mensaje controlado", async () => {
  mock.method(console, "error", () => {});
  mock.method(Trabajador, "findById", async () => { throw new Error("BD desconectada"); });
  assert.equal((await post(entrada())).status, 500);
  mock.method(Asistencia, "find", () => { throw new Error("BD desconectada"); });
  assert.equal((await solicitar(`${base}/hoy`)).status, 500);
});
