const { test } = require("node:test");
const assert = require("node:assert/strict");
const { jornada, evaluar, fechaValida } = require("../src/utils/jornada");
const persona = { _id: "a", nombre: "Ana", activo: true };
const horario = { _id: "1", trabajador: "a", tipo: "horario", desde: "2026-01-01", createdAt: "2026-01-01", dias: [{ dia: 2, entrada: "08:00", salida: "17:00" }], tolerancia: 10 };
const fecha = "2026-11-10"; // martes
const calcular = (planes = [horario], registro, ahora = "2026-11-10T15:00:00Z") => evaluar(persona, fecha, planes, registro, new Date(ahora));
test("valida días reales, incluidos años bisiestos", () => {
  for (const f of ["2026-02-29", "2026-02-30", "10/11/2026", {}, "2026-13-01"]) assert.equal(fechaValida(f), false);
  assert.equal(fechaValida("2028-02-29"), true);
});
test("horarios diferentes por trabajador y descanso semanal", () => {
  assert.equal(jornada(persona, fecha, [horario]).entrada, "08:00");
  assert.equal(jornada({ ...persona, _id: "b" }, fecha, [horario]).tipo, "sin_horario");
  assert.equal(jornada(persona, "2026-11-15", [horario]).tipo, "descanso");
});
test("la nueva vigencia no reescribe jornadas anteriores", () => {
  const nuevo = { ...horario, desde: "2026-11-11", dias: [{ dia: 2, entrada: "09:00", salida: "18:00" }] };
  assert.equal(jornada(persona, fecha, [horario, nuevo]).entrada, "08:00");
  assert.equal(jornada(persona, "2026-11-17", [horario, nuevo]).entrada, "09:00");
});
test("última versión de la misma fecha sustituye horario sin borrarlo", () => {
  const nuevo = { ...horario, _id: "2", createdAt: "2026-11-01", tolerancia: 20 };
  assert.equal(jornada(persona, fecha, [horario, nuevo]).tolerancia, 20);
});
test("festivos y descansos nunca generan ausencias", () => {
  const festivo = { tipo: "festivo", desde: fecha, hasta: fecha, motivo: "Festivo" };
  assert.equal(calcular([horario, festivo], null, "2026-11-11T05:00:00Z").estado, "no_laborable");
});
test("excepción individual prevalece sobre festivo general", () => {
  const general = { tipo: "festivo", desde: fecha, hasta: fecha };
  const individual = { tipo: "laborable", trabajador: "a", desde: fecha, hasta: fecha, dias: [{ entrada: "10:00", salida: "14:00" }], tolerancia: 5 };
  const p = jornada(persona, fecha, [horario, general, individual]);
  assert.equal(p.entrada, "10:00"); assert.equal(p.tolerancia, 5);
});
test("justificación conserva registro original y evita ausencia", () => {
  assert.equal(calcular([horario, { tipo: "justificado", trabajador: "a", desde: fecha, hasta: fecha }]).estado, "justificado");
});
test("tolerancia inclusiva y retardo fuera del margen", () => {
  assert.equal(calcular(undefined, { llegada: "2026-11-10T14:10:00Z" }).retardo, 0);
  assert.equal(calcular(undefined, { llegada: "2026-11-10T14:11:00Z" }).retardo, 1);
});
test("antes del turno programado, después del margen pendiente y al cierre ausente", () => {
  assert.equal(calcular(undefined, null, "2026-11-10T13:00:00Z").estado, "programado");
  assert.equal(calcular().estado, "pendiente");
  assert.equal(calcular(undefined, null, "2026-11-10T23:00:00Z").estado, "ausente");
});
test("día futuro no cuenta como falta y trabajador sin horario tampoco", () => {
  assert.equal(calcular(undefined, null, "2026-11-09T23:00:00Z").estado, "programado");
  assert.equal(calcular([]).estado, "sin_horario");
});
test("finalizado conserva retardo y calcula duración real", () => {
  const f = calcular(undefined, { llegada: "2026-11-10T14:20:00Z", salida: "2026-11-10T23:00:00Z" });
  assert.equal(f.estado, "finalizado"); assert.equal(f.retardo, 10); assert.equal(f.minutosTrabajados, 520);
});
