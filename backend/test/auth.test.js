process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-with-at-least-32-characters-long";

const { test, before, after, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Trabajador = require("../src/models/Trabajador");
const Usuario = require("../src/models/Usuario");

const admin = { _id: "507f1f77bcf86cd799439011", email: "admin@gmail.com", rol: "admin" };
const usuario = { _id: "507f1f77bcf86cd799439012", email: "persona@empresa.com", rol: "usuario" };
const ficha = "507f1f77bcf86cd799439013";
let servidor;
let base;

before(async () => {
  servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});
after(() => new Promise((resolve, reject) => {
  servidor.close((error) => error ? reject(error) : resolve());
}));
afterEach(() => mock.restoreAll());

const tokenPara = (persona) => jwt.sign({ sub: persona._id }, process.env.JWT_SECRET);
const solicitar = (ruta, { persona, ...opciones } = {}) => fetch(`${base}${ruta}`, {
  ...opciones,
  headers: {
    ...(opciones.body ? { "Content-Type": "application/json" } : {}),
    ...(persona ? { Authorization: `Bearer ${tokenPara(persona)}` } : {}),
    ...opciones.headers,
  },
});

test("rechaza el acceso a los módulos si falta o es inválido el JWT", async () => {
  assert.equal((await solicitar("/dashboard/resumen")).status, 401);
  assert.equal((await solicitar("/dashboard/resumen", {
    headers: { Authorization: "Bearer token-invalido" },
  })).status, 401);
});

test("login valida contraseña y responde con JWT y datos públicos", async () => {
  const hash = await bcrypt.hash("una-clave-segura-123", 4);
  mock.method(Usuario, "findOne", () => ({
    select: async () => ({ ...admin, rol: "superadmin", password: hash }),
  }));

  const respuesta = await solicitar("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: " ADMIN@gmail.com ", password: "una-clave-segura-123" }),
  });
  const datos = await respuesta.json();
  assert.equal(respuesta.status, 200);
  assert.equal(datos.usuario.email, admin.email);
  assert.equal(datos.usuario.rol, "admin");
  assert.equal(jwt.verify(datos.token, process.env.JWT_SECRET).sub, admin._id);
  assert.equal("password" in datos.usuario, false);
});

test("login no revela si el correo existe", async () => {
  mock.method(Usuario, "findOne", () => ({ select: async () => null }));
  const respuesta = await solicitar("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "no-existe@gmail.com", password: "clave-incorrecta" }),
  });
  assert.equal(respuesta.status, 401);
  assert.deepEqual(await respuesta.json(), { mensaje: "Correo o contraseña incorrectos" });
});

test("solo el administrador puede crear usuarios y el rol no se acepta del cliente", async () => {
  mock.method(Usuario, "findById", (id) => ({
    select: async () => id === admin._id ? admin : usuario,
  }));
  mock.method(bcrypt, "hash", async (password, saltos) => {
    assert.equal(password, "Clave8!x");
    assert.equal(saltos, 12);
    return "hash-seguro";
  });
  mock.method(Trabajador, "exists", async (filtro) => {
    assert.deepEqual(filtro, { _id: ficha, activo: true });
    return { _id: ficha };
  });
  mock.method(Usuario, "findOneAndUpdate", async (filtro, cambio, opciones) => {
    assert.deepEqual(filtro, { email: "ricardo@laprovidencia", rol: "usuario", trabajador: null });
    assert.deepEqual(cambio, {
      $set: { trabajador: ficha, password: "hash-seguro", debeCambiarContrasena: true },
      $inc: { versionSesion: 1 },
    });
    assert.equal(opciones.upsert, true);
    return { ...usuario, email: filtro.email, ...cambio.$set };
  });

  const noAdmin = await solicitar("/auth/users", {
    method: "POST",
    persona: usuario,
    body: JSON.stringify({ email: "ricardo@laprovidencia", password: "Clave8!x", trabajador: ficha, rol: "superadmin" }),
  });
  assert.equal(noAdmin.status, 403);

  const creado = await solicitar("/auth/users", {
    method: "POST",
    persona: admin,
    body: JSON.stringify({ email: "ricardo@laprovidencia", password: "Clave8!x", trabajador: ficha, rol: "superadmin" }),
  });
  assert.equal(creado.status, 201);
  assert.deepEqual((await creado.json()).usuario, {
    id: usuario._id,
    email: "ricardo@laprovidencia",
    rol: "usuario",
    trabajador: ficha,
    debeCambiarContrasena: true,
  });
});

test("el endpoint para crear usuarios rechaza contraseñas débiles", async () => {
  mock.method(Usuario, "findById", () => ({ select: async () => admin }));
  const respuesta = await solicitar("/auth/users", {
    method: "POST",
    persona: admin,
    body: JSON.stringify({ email: "nuevo@empresa.com", password: "Clave7!" }),
  });
  assert.equal(respuesta.status, 400);
});

test("solo el administrador puede listar usuarios y no se muestra su cuenta", async () => {
  mock.method(Usuario, "findById", () => ({
    select: async () => usuario,
  }));
  const noAdmin = await solicitar("/auth/users", { persona: usuario });
  assert.equal(noAdmin.status, 403);

  mock.restoreAll();
  mock.method(Usuario, "findById", () => ({
    select: async () => ({ ...admin, rol: "superadmin" }),
  }));
  mock.method(Usuario, "find", () => ({
    select() {
      return this;
    },
    sort: async () => [usuario],
  }));

  const respuesta = await solicitar("/auth/users", { persona: admin });
  assert.equal(respuesta.status, 200);
  assert.deepEqual((await respuesta.json()).usuarios.map(({ email, rol }) => ({ email, rol })), [
    { email: usuario.email, rol: "usuario" },
  ]);
});

test("solo el administrador puede cambiar la contraseña de una cuenta de usuario", async () => {
  mock.method(Usuario, "findById", () => ({
    select: async () => admin,
  }));
  mock.method(Usuario, "findOneAndUpdate", async (filtro, cambio) => {
    assert.deepEqual(filtro, { _id: usuario._id, rol: "usuario", trabajador: { $ne: null } });
    assert.deepEqual(cambio, {
      $set: { password: "hash-nuevo", debeCambiarContrasena: true },
      $inc: { versionSesion: 1 },
    });
    return { ...usuario, ...cambio.$set };
  });
  mock.method(bcrypt, "hash", async (password, saltos) => {
    assert.equal(password, "Clave8!x");
    assert.equal(saltos, 12);
    return "hash-nuevo";
  });

  const respuesta = await solicitar(`/auth/users/${usuario._id}/password`, {
    method: "PATCH",
    persona: admin,
    body: JSON.stringify({ password: "Clave8!x" }),
  });
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).usuario.debeCambiarContrasena, true);
});

test("el cambio de contraseña admin rechaza IDs inválidos y contraseñas débiles", async () => {
  mock.method(Usuario, "findById", () => ({
    select: async () => admin,
  }));
  const idInvalido = await solicitar("/auth/users/no-es-id/password", {
    method: "PATCH",
    persona: admin,
    body: JSON.stringify({ password: "Clave8!x" }),
  });
  assert.equal(idInvalido.status, 400);

  const passwordDebil = await solicitar(`/auth/users/${usuario._id}/password`, {
    method: "PATCH",
    persona: admin,
    body: JSON.stringify({ password: "Clave7!" }),
  });
  assert.equal(passwordDebil.status, 400);
});

test("la contraseña temporal limita el acceso hasta que se actualiza", async () => {
  mock.method(Usuario, "findById", () => ({
    select: async () => ({ ...admin, debeCambiarContrasena: true }),
  }));
  const token = jwt.sign({ sub: admin._id }, process.env.JWT_SECRET);
  const protegida = await solicitar("/dashboard/resumen", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(protegida.status, 403);

  const sesion = await solicitar("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(sesion.status, 200);
  assert.equal((await sesion.json()).usuario.debeCambiarContrasena, true);
});

test("el administrador puede reemplazar la contraseña temporal", async () => {
  const cuenta = {
    ...admin,
    password: "hash-anterior",
    debeCambiarContrasena: true,
  };
  mock.method(Usuario, "findById", () => ({
    select: async (campos) => campos === "+password"
      ? cuenta
      : { ...admin, debeCambiarContrasena: cuenta.debeCambiarContrasena },
  }));
  mock.method(bcrypt, "compare", async (actual, hash) => {
    assert.equal(actual, "admin");
    assert.equal(hash, "hash-anterior");
    return true;
  });
  mock.method(bcrypt, "hash", async (nueva, saltos) => {
    assert.equal(nueva, "una-clave-nueva-segura");
    assert.equal(saltos, 12);
    return "hash-nuevo";
  });

  mock.method(Usuario, "findOneAndUpdate", async (filtro, cambio) => {
    assert.deepEqual(filtro, { _id: admin._id, password: "hash-anterior" });
    assert.deepEqual(cambio, {
      $set: { password: "hash-nuevo", debeCambiarContrasena: false },
      $inc: { versionSesion: 1 },
    });
    return { ...cuenta, ...cambio.$set, versionSesion: 1 };
  });

  const respuesta = await solicitar("/auth/change-password", {
    method: "POST",
    persona: admin,
    body: JSON.stringify({
      contrasenaActual: "admin",
      contrasenaNueva: "una-clave-nueva-segura",
    }),
  });
  assert.equal(respuesta.status, 200);
  const datos = await respuesta.json();
  assert.equal(datos.usuario.debeCambiarContrasena, false);
  assert.equal(jwt.verify(datos.token, process.env.JWT_SECRET).version, 1);
});
