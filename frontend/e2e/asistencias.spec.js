import { test, expect } from "@playwright/test";

const id = "507f1f77bcf86cd799439011";
const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
const equipo = [{ _id: id, nombre: "Ana Torres", activo: true }];
async function preparar(page, personal = false) {
  const planes = [];
  const registros = [];
  await page.addInitScript(() => localStorage.setItem("laprovidencia_token", "fixture-no-real-token"));
  await page.route("**/api/**", async route => {
    const u = new URL(route.request().url());
    let datos = {};
    if (u.pathname === "/api/auth/me") datos = { usuario: { rol: personal ? "usuario" : "admin", usuario: "QA", trabajador: personal ? id : null } };
    if (u.pathname === "/api/trabajadores") datos = { trabajadores: equipo };
    if (u.pathname === "/api/tareas") datos = { tareas: [] };
    if (u.pathname === "/api/mi-trabajo") datos = { tareas: [], trabajos: [], gavetas: [] };
    if (u.pathname === "/api/asistencias/planes") {
      if (route.request().method() === "POST") planes.unshift({ ...route.request().postDataJSON(), _id: "plan1", createdAt: new Date().toISOString(), autor: { usuario: "QA" }, trabajador: equipo[0] });
      datos = { planes };
    }
    if (u.pathname === "/api/asistencias/auditoria") datos = { registros: [] };
    if (u.pathname === "/api/asistencias/historial") datos = {
      desde: fecha, hasta: fecha, total: 1, paginas: 1,
      resumen: { trabajando: 1, finalizado: 0, pendiente: 0, ausente: 0, retardos: 0 },
      filas: [{ trabajador: equipo[0], fecha, plan: { entrada: "08:00", salida: "17:00", tolerancia: 10, motivo: "Jornada programada" }, estado: "trabajando", llegada: `${fecha}T14:05:00Z`, salida: null, retardo: 0, minutosTrabajados: null }],
    };
    if (u.pathname === "/api/asistencias/zona") datos = { zona: { latitud: 21.5224892, longitud: -102.246005, radioMetros: 100, precisionMaxima: 100, zonaHoraria: "America/Mexico_City", direccion: "Zona de prueba" } };
    if (u.pathname === "/api/asistencias/hoy") datos = { fecha, asistencias: registros };
    if (u.pathname === "/api/asistencias/" && route.request().method() === "POST") {
      registros.push({ _id: "registro1", trabajador: id, fecha, llegada: new Date().toISOString(), salida: null });
      datos = { asistencia: registros[0] };
    }
    if (u.pathname === "/api/asistencias/salida" && route.request().method() === "POST") {
      registros[0].salida = new Date().toISOString(); datos = { asistencia: registros[0] };
    }
    await route.fulfill({ json: datos });
  });
  await page.goto("/");
  if (personal) await page.getByRole("button", { name: "Mi asistencia", exact: true }).click();
  else {
    const menu = page.getByRole("button", { name: "Abrir menú", exact: true });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("button", { name: "Asistencia", exact: true }).click();
  }
}

test("admin consulta jornadas, guarda horario y ve la versión auditada", async ({ page }, testInfo) => {
  const errores = []; page.on("pageerror", e => errores.push(e.message));
  await preparar(page);
  await expect(page.getByRole("heading", { name: "Control de asistencias" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Ana Torres", exact: false })).toBeVisible();
  await page.screenshot({ path: `test-results/control-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole("button", { name: "Horarios", exact: true }).click();
  await page.getByRole("combobox", { name: "Trabajador", exact: true }).selectOption(id);
  await page.getByLabel("Motivo del cambio").fill("Horario individual de prueba");
  await page.getByRole("button", { name: "Guardar configuración" }).click();
  await expect(page.getByRole("status")).toContainText("Configuración guardada");
  await expect(page.getByRole("cell", { name: "Horario individual de prueba", exact: true })).toBeVisible();
  await page.screenshot({ path: `test-results/horarios-${testInfo.project.name}.png`, fullPage: true });
  expect(errores).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("trabajador ve jornada, GPS e historial personal sin controles administrativos", async ({ page }, testInfo) => {
  await preparar(page, true);
  await expect(page.getByRole("heading", { name: "Mi historial", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verificar mi ubicación" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar llegada", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Horarios", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Auditoría", exact: true })).toHaveCount(0);
  await page.screenshot({ path: `test-results/trabajador-${testInfo.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("trabajador registra entrada y salida con GPS en zona", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 21.5224892, longitude: -102.246005, accuracy: 10 });
  await preparar(page, true);
  await page.getByRole("button", { name: "Verificar mi ubicación" }).click();
  await expect(page.getByRole("button", { name: "Registrar llegada", exact: true })).toBeEnabled();
  const entrada = page.waitForRequest(r => r.method() === "POST" && new URL(r.url()).pathname === "/api/asistencias/");
  await page.getByRole("button", { name: "Registrar llegada", exact: true }).click();
  expect((await entrada).postDataJSON()).toMatchObject({ trabajador: id, latitud: 21.5224892, longitud: -102.246005 });
  await expect(page.getByRole("button", { name: "Checar salida", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Checar salida", exact: true }).click();
  await expect(page.getByRole("button", { name: "Salida registrada", exact: true })).toBeDisabled();
});

test("admin configura festivo general y consulta filtros", async ({ page }) => {
  await preparar(page);
  await page.getByRole("button", { name: "Calendario", exact: true }).click();
  await page.getByLabel("Motivo del cambio").fill("Festivo de prueba");
  const guardado = page.waitForRequest(r => r.method() === "POST" && r.url().endsWith("/api/asistencias/planes"));
  await page.getByRole("button", { name: "Guardar configuración" }).click();
  expect((await guardado).postDataJSON()).toMatchObject({ tipo: "festivo", trabajador: null, motivo: "Festivo de prueba" });
  await expect(page.getByRole("status")).toContainText("Configuración guardada");
  await page.getByRole("button", { name: "Control y reportes", exact: true }).click();
  await page.getByRole("combobox", { name: "Estado", exact: true }).selectOption("trabajando");
  const consulta = page.waitForRequest(r => new URL(r.url()).searchParams.get("estado") === "trabajando");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  expect(new URL((await consulta).url()).pathname).toBe("/api/asistencias/historial");
});
