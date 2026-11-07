const { test, before, after, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
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
const post = (datos) => fetch(base, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
});

test("zona pública fija de 100 metros y respuestas sin caché", async () => {
  const respuesta = await fetch(`${base}/zona`);
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
      select(campos) { assert.equal(campos, "trabajador fecha llegada"); return this; },
      populate(modelo, campos) { assert.equal(modelo, "trabajador"); assert.equal(campos, "nombre"); return this; },
      sort(orden) { assert.deepEqual(orden, { llegada: -1 }); return Promise.resolve([]); },
    };
  });
  const respuesta = await fetch(`${base}/hoy`);
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { fecha: fechaLocal(), asistencias: [] });
});

test("fallos de BD devuelven 500 con mensaje controlado", async () => {
  mock.method(console, "error", () => {});
  mock.method(Trabajador, "findById", async () => { throw new Error("BD desconectada"); });
  assert.equal((await post(entrada())).status, 500);
  mock.method(Asistencia, "find", () => { throw new Error("BD desconectada"); });
  assert.equal((await fetch(`${base}/hoy`)).status, 500);
});
