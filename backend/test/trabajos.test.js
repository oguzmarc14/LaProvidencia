process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-with-at-least-32-characters-long";

const { test, before, beforeEach, after, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Trabajo = require("../src/models/Trabajo");
const Usuario = require("../src/models/Usuario");

const id = "507f1f77bcf86cd799439011";
const datos = {
  nombre: "Ventana", material: "vidrio",
  fechaInicio: "2026-10-13", fechaFinal: "2026-10-20",
};
let servidor;
let base;
const token = jwt.sign({ sub: id }, process.env.JWT_SECRET);

function configurarAutenticacion() {
  mock.method(Usuario, "findById", () => ({
    select: async () => ({ _id: id, email: "admin@gmail.com", rol: "superadmin" }),
  }));
}

before(async () => {
  servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  base = `http://127.0.0.1:${servidor.address().port}/api/trabajos`;
});
beforeEach(configurarAutenticacion);
after(() => new Promise((resolve, reject) => {
  servidor.close((error) => error ? reject(error) : resolve());
}));
afterEach(() => mock.restoreAll());

const solicitar = (ruta = "", method = "GET", body) => fetch(base + ruta, {
  method,
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

test("POST crea un trabajo y devuelve sus datos", async () => {
  mock.method(Trabajo, "create", async (entrada) => {
    assert.deepEqual(entrada.nombre, datos.nombre);
    return { _id: id, ...entrada };
  });
  const respuesta = await solicitar("", "POST", datos);
  assert.equal(respuesta.status, 201);
  assert.equal((await respuesta.json()).trabajo._id, id);
});

test("POST rechaza nombres vacíos y errores de validación del modelo", async () => {
  assert.equal((await solicitar("", "POST", { nombre: " " })).status, 400);
  mock.method(Trabajo, "create", async (entrada) => {
    await new Trabajo(entrada).validate();
    assert.fail("El modelo debe rechazar un material inválido");
  });
  assert.equal((await solicitar("", "POST", { ...datos, material: "metal" })).status, 400);
});

test("GET lista trabajos, incluida una colección vacía", async () => {
  mock.method(Trabajo, "find", async () => []);
  const respuesta = await solicitar();
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { trabajos: [] });
});

test("GET consulta un trabajo por ID", async () => {
  mock.method(Trabajo, "findById", async (entrada) => {
    assert.equal(entrada, id);
    return { _id: id, ...datos };
  });
  const respuesta = await solicitar(`/${id}`);
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).trabajo._id, id);
});

test("GET y HEAD distinguen IDs inválidos de trabajos inexistentes", async () => {
  mock.method(Trabajo, "findById", async () => null);
  for (const method of ["GET", "HEAD"]) {
    assert.equal((await solicitar("/incorrecto", method)).status, 400);
    assert.equal((await solicitar(`/${id}`, method)).status, 404);
  }
});

test("HEAD responde para colección y detalle sin enviar cuerpo", async () => {
  mock.method(Trabajo, "find", async () => [{ _id: id }]);
  mock.method(Trabajo, "findById", async () => ({ _id: id }));
  for (const ruta of ["", `/${id}`]) {
    const respuesta = await solicitar(ruta, "HEAD");
    assert.equal(respuesta.status, 200);
    assert.equal(await respuesta.text(), "");
    assert.match(respuesta.headers.get("content-type"), /application\/json/);
  }
});

test("PUT actualiza campos permitidos y activa las validaciones", async () => {
  mock.method(Trabajo, "findByIdAndUpdate", async (entrada, actualizacion, opciones) => {
    assert.equal(entrada, id);
    assert.deepEqual(actualizacion, { $set: { estado: "finalizado" } });
    assert.deepEqual(opciones, { new: true, runValidators: true });
    return { _id: id, ...datos, estado: "finalizado" };
  });
  const respuesta = await solicitar(`/${id}`, "PUT", {
    estado: "finalizado", _id: "otro", $unset: { nombre: 1 },
  });
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).trabajo.estado, "finalizado");
});

test("PUT rechaza IDs inválidos, cuerpos vacíos y nombres vacíos", async () => {
  assert.equal((await solicitar("/incorrecto", "PUT", datos)).status, 400);
  for (const body of [undefined, {}, { nombre: " " }, { nombre: null }, { _id: id }]) {
    assert.equal((await solicitar(`/${id}`, "PUT", body)).status, 400);
  }
});

test("PUT devuelve 404 si el trabajo no existe", async () => {
  mock.method(Trabajo, "findByIdAndUpdate", async () => null);
  assert.equal((await solicitar(`/${id}`, "PUT", { estado: "finalizado" })).status, 404);
});

test("PUT devuelve 400 ante errores de validación o conversión", async () => {
  for (const name of ["ValidationError", "CastError"]) {
    mock.method(Trabajo, "findByIdAndUpdate", async () => {
      const error = new Error("Datos inválidos");
      error.name = name;
      throw error;
    });
    assert.equal((await solicitar(`/${id}`, "PUT", { material: "metal" })).status, 400);
    mock.restoreAll();
    configurarAutenticacion();
  }
});

test("DELETE elimina un trabajo y distingue 400 y 404", async () => {
  mock.method(Trabajo, "findByIdAndDelete", async (entrada) => {
    assert.equal(entrada, id);
    return { _id: id };
  });
  assert.equal((await solicitar(`/${id}`, "DELETE")).status, 200);
  assert.equal((await solicitar("/incorrecto", "DELETE")).status, 400);
  mock.restoreAll();
  configurarAutenticacion();
  mock.method(Trabajo, "findByIdAndDelete", async () => null);
  assert.equal((await solicitar(`/${id}`, "DELETE")).status, 404);
});

test("Los errores de base de datos devuelven 500", async () => {
  mock.method(console, "error", () => {});
  for (const metodo of ["find", "findById", "create", "findByIdAndUpdate", "findByIdAndDelete"]) {
    mock.method(Trabajo, metodo, async () => { throw new Error("BD no disponible"); });
  }
  for (const [ruta, method, body] of [
    ["", "GET"], [`/${id}`, "GET"], ["", "POST", datos],
    [`/${id}`, "PUT", { estado: "finalizado" }], [`/${id}`, "DELETE"],
  ]) {
    assert.equal((await solicitar(ruta, method, body)).status, 500);
  }
});
