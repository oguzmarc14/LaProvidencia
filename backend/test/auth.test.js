process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-with-at-least-32-characters-long";

const { test, before, after, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Usuario = require("../src/models/Usuario");

const admin = { _id: "507f1f77bcf86cd799439011", email: "admin@gmail.com", rol: "superadmin" };
const usuario = { _id: "507f1f77bcf86cd799439012", email: "persona@empresa.com", rol: "usuario" };
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
    select: async () => ({ ...admin, password: hash }),
  }));

  const respuesta = await solicitar("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: " ADMIN@gmail.com ", password: "una-clave-segura-123" }),
  });
  const datos = await respuesta.json();
  assert.equal(respuesta.status, 200);
  assert.equal(datos.usuario.email, admin.email);
  assert.equal(datos.usuario.rol, "superadmin");
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

test("solo el superadmin puede crear usuarios y el rol no se acepta del cliente", async () => {
  mock.method(Usuario, "findById", (id) => ({
    select: async () => id === admin._id ? admin : usuario,
  }));
  mock.method(bcrypt, "hash", async (password, saltos) => {
    assert.equal(password, "contraseña-de-prueba");
    assert.equal(saltos, 12);
    return "hash-seguro";
  });
  mock.method(Usuario, "create", async (datos) => {
    assert.deepEqual(datos, {
      email: usuario.email,
      password: "hash-seguro",
      rol: "usuario",
      debeCambiarContrasena: true,
    });
    return { ...usuario, ...datos };
  });

  const noAdmin = await solicitar("/auth/users", {
    method: "POST",
    persona: usuario,
    body: JSON.stringify({ email: usuario.email, password: "contraseña-de-prueba", rol: "superadmin" }),
  });
  assert.equal(noAdmin.status, 403);

  const creado = await solicitar("/auth/users", {
    method: "POST",
    persona: admin,
    body: JSON.stringify({ email: usuario.email, password: "contraseña-de-prueba", rol: "superadmin" }),
  });
  assert.equal(creado.status, 201);
  assert.deepEqual((await creado.json()).usuario, {
    id: usuario._id,
    email: usuario.email,
    rol: "usuario",
    debeCambiarContrasena: true,
  });
});

test("el endpoint para crear usuarios rechaza contraseñas débiles", async () => {
  mock.method(Usuario, "findById", () => ({ select: async () => admin }));
  const respuesta = await solicitar("/auth/users", {
    method: "POST",
    persona: admin,
    body: JSON.stringify({ email: "nuevo@empresa.com", password: "corta" }),
  });
  assert.equal(respuesta.status, 400);
});

test("solo el superadmin puede listar usuarios y no se muestra su cuenta", async () => {
  mock.method(Usuario, "findById", () => ({
    select: async () => usuario,
  }));
  const noAdmin = await solicitar("/auth/users", { persona: usuario });
  assert.equal(noAdmin.status, 403);

  mock.restoreAll();
  mock.method(Usuario, "findById", () => ({
    select: async () => admin,
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

test("solo el superadmin puede cambiar la contraseña de una cuenta de usuario", async () => {
  mock.method(Usuario, "findById", () => ({
    select: async () => admin,
  }));
  const cuenta = {
    ...usuario,
    password: "hash-anterior",
    debeCambiarContrasena: false,
    save: mock.fn(async () => {}),
  };
  mock.method(Usuario, "findOne", async (filtro) => {
    assert.deepEqual(filtro, { _id: usuario._id, rol: "usuario" });
    return cuenta;
  });
  mock.method(bcrypt, "hash", async (password, saltos) => {
    assert.equal(password, "nueva-clave-temporal");
    assert.equal(saltos, 12);
    return "hash-nuevo";
  });

  const respuesta = await solicitar(`/auth/users/${usuario._id}/password`, {
    method: "PATCH",
    persona: admin,
    body: JSON.stringify({ password: "nueva-clave-temporal" }),
  });
  assert.equal(respuesta.status, 200);
  assert.equal(cuenta.password, "hash-nuevo");
  assert.equal(cuenta.debeCambiarContrasena, true);
  assert.equal(cuenta.save.mock.callCount(), 1);
  assert.equal((await respuesta.json()).usuario.debeCambiarContrasena, true);
});

test("el cambio de contraseña admin rechaza IDs inválidos y contraseñas débiles", async () => {
  mock.method(Usuario, "findById", () => ({
    select: async () => admin,
  }));
  const idInvalido = await solicitar("/auth/users/no-es-id/password", {
    method: "PATCH",
    persona: admin,
    body: JSON.stringify({ password: "nueva-clave-temporal" }),
  });
  assert.equal(idInvalido.status, 400);

  const passwordDebil = await solicitar(`/auth/users/${usuario._id}/password`, {
    method: "PATCH",
    persona: admin,
    body: JSON.stringify({ password: "corta" }),
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

test("el superadmin puede reemplazar la contraseña temporal", async () => {
  const cuenta = {
    ...admin,
    password: "hash-anterior",
    debeCambiarContrasena: true,
    save: mock.fn(async () => {}),
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

  const respuesta = await solicitar("/auth/change-password", {
    method: "POST",
    persona: admin,
    body: JSON.stringify({
      contrasenaActual: "admin",
      contrasenaNueva: "una-clave-nueva-segura",
    }),
  });
  assert.equal(respuesta.status, 200);
  assert.equal(cuenta.password, "hash-nuevo");
  assert.equal(cuenta.debeCambiarContrasena, false);
  assert.equal(cuenta.save.mock.callCount(), 1);
  assert.equal((await respuesta.json()).usuario.debeCambiarContrasena, false);
});
