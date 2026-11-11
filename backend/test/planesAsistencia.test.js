process.env.JWT_SECRET ||= "test-secret-with-at-least-32-characters-long";
const { test, before, after, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Usuario = require("../src/models/Usuario");
const Trabajador = require("../src/models/Trabajador");
const Plan = require("../src/models/PlanAsistencia");
const Asistencia = require("../src/models/Asistencia");
const id = "507f1f77bcf86cd799439011", otro = "507f1f77bcf86cd799439012";
let servidor, base;
before(async () => { servidor = app.listen(0, "127.0.0.1"); await once(servidor, "listening"); base = `http://127.0.0.1:${servidor.address().port}/api/asistencias`; });
after(() => new Promise(resolve => servidor.close(resolve)));
afterEach(() => mock.restoreAll());
function sesion(rol = "admin") {
  mock.method(Usuario, "findById", () => ({ select: async () => ({ _id: id, rol, trabajador: id }) }));
  mock.method(Trabajador, "exists", async () => ({ _id: id }));
}
const pedir = (ruta, datos) => fetch(base + ruta, { headers: { Authorization: `Bearer ${jwt.sign({ sub: id }, process.env.JWT_SECRET)}`, "Content-Type": "application/json" }, ...(datos ? { method: "POST", body: JSON.stringify(datos) } : {}) });
const valido = { tipo: "horario", trabajador: id, desde: "2026-11-10", dias: [{ dia: 2, entrada: "08:00", salida: "17:00" }], tolerancia: 10, motivo: "Nuevo horario" };
function datosReporte(personal = false) {
  mock.method(Trabajador, "find", filtro => { assert.deepEqual(filtro, personal ? { _id: id } : {}); return { select: () => ({ lean: async () => [{ _id: id, nombre: "=Ana", activo: true }] }) }; });
  mock.method(Asistencia, "find", filtro => {
    if (personal) assert.equal(filtro.trabajador, id);
    return { select: campos => { assert.ok(!campos.includes("latitud")); return { lean: async () => [] }; } };
  });
  mock.method(Plan, "find", filtro => {
    if (personal) assert.deepEqual(filtro.$or, [{ trabajador: id }, { trabajador: null }]);
    return { lean: async () => [{ ...valido, trabajador: id }] };
  });
}
test("todas las rutas requieren autenticación", async () => {
  for (const ruta of ["/historial", "/planes", "/auditoria"]) assert.equal((await fetch(base + ruta)).status, 401);
});
test("trabajador no puede consultar planes o evidencia ni configurar horarios", async () => {
  sesion("usuario");
  for (const ruta of ["/planes", "/auditoria"]) assert.equal((await pedir(ruta)).status, 403);
  assert.equal((await pedir("/planes", valido)).status, 403);
});
test("historial y CSV ignoran trabajador ajeno e imponen ficha de sesión", async () => {
  sesion("usuario"); datosReporte(true);
  for (const formato of ["", "&formato=csv"]) {
    const r = await pedir(`/historial?desde=2026-11-10&hasta=2026-11-10&trabajador=${otro}${formato}`);
    assert.equal(r.status, 200);
    if (!formato) assert.equal((await r.json()).filas[0].trabajador._id, id);
  }
});
test("reporte CSV protege fórmulas y contiene todo el resultado filtrado", async () => {
  sesion(); datosReporte();
  const r = await pedir("/historial?desde=2026-11-10&hasta=2026-11-10&formato=csv");
  assert.equal(r.status, 200); assert.match(r.headers.get("content-type"), /text\/csv/);
  assert.match(await r.text(), /"'=Ana"/);
});
test("rechaza rangos excesivos, fechas inexistentes, IDs e inyección de filtros", async () => {
  sesion();
  for (const q of ["desde=2026-01-01&hasta=2026-12-31", "desde=2026-02-30", "trabajador=bad", "estado=bad", "pagina=-1", "desde=2026-11-11&hasta=2026-11-10", "buscar[x]=y"]) assert.equal((await pedir("/historial?" + q)).status, 400);
});
test("valida turnos, tolerancia, alcance, motivos y días repetidos", async () => {
  sesion(); mock.method(Plan, "create", () => assert.fail("No guardar entradas inválidas"));
  for (const cambio of [{ tolerancia: -1 }, { tolerancia: "10" }, { tolerancia: 181 }, { motivo: " " }, { trabajador: null }, { desde: "2026-02-30" }, { dias: [{ dia: 2, entrada: "17:00", salida: "08:00" }] }, { dias: [valido.dias[0], valido.dias[0]] }, { tipo: "festivo", hasta: null }]) assert.equal((await pedir("/planes", { ...valido, ...cambio })).status, 400);
});
test("guarda versión y autor del servidor ignorando intento de suplantación", async () => {
  sesion(); mock.method(Plan, "create", async p => { assert.equal(p.autor, id); assert.equal(p.motivo, "Nuevo horario"); return p; });
  const r = await pedir("/planes", { ...valido, autor: otro }); assert.equal(r.status, 201);
});
test("festivo general y descanso semanal completo son configuraciones válidas", async () => {
  sesion(); mock.method(Plan, "create", async p => p);
  assert.equal((await pedir("/planes", { ...valido, dias: [] })).status, 201);
  assert.equal((await pedir("/planes", { tipo: "festivo", desde: "2026-12-25", hasta: "2026-12-25", motivo: "Festivo general" })).status, 201);
});
test("errores de base de datos no exponen detalles", async () => {
  sesion(); mock.method(console, "error", () => {}); mock.method(Plan, "create", async () => { throw new Error("secret"); });
  const r = await pedir("/planes", valido); assert.equal(r.status, 500); assert.doesNotMatch(await r.text(), /secret/);
});
