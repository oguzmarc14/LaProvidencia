import { test } from "node:test";
import assert from "node:assert/strict";
import { consultarUbicacion } from "../src/modulos/asistencias/services/ubicacion.js";

test("renueva la lectura cada 10 segundos aunque las coordenadas no cambien", (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  let consultas = 0;
  const lecturas = [];
  const gps = {
    getCurrentPosition(recibir, fallar, opciones) {
      assert.equal(opciones.maximumAge, 0);
      consultas++;
      recibir({ coords: { latitude: 21.5224892, longitude: -102.246005, accuracy: 10 }, timestamp: consultas * 10000 });
    },
  };
  const detener = consultarUbicacion(gps, (lectura) => lecturas.push(lectura), assert.fail);
  t.after(detener);
  t.mock.timers.tick(40000);
  assert.equal(consultas, 5);
  assert.equal(lecturas.at(-1).timestamp, 50000);
  assert.deepEqual(lecturas[0].coords, lecturas.at(-1).coords);
  detener();
  t.mock.timers.tick(30000);
  assert.equal(consultas, 5);
});

test("no acumula consultas y descarta respuestas que llegan después de cerrar la pantalla", (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  let consultas = 0;
  let responder;
  const gps = { getCurrentPosition(recibir) { consultas++; responder = recibir; } };
  const detener = consultarUbicacion(gps, () => assert.fail("La consulta ya se detuvo"), assert.fail);
  t.after(detener);
  t.mock.timers.tick(20000);
  assert.equal(consultas, 1);
  detener();
  responder({ timestamp: Date.now() });
});

test("vuelve a intentar después de un error temporal de ubicación", (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  let consultas = 0;
  let errores = 0;
  let lecturas = 0;
  const gps = {
    getCurrentPosition(recibir, fallar) {
      if (++consultas === 1) fallar({ code: 3 });
      else recibir({ timestamp: Date.now() });
    },
  };
  const detener = consultarUbicacion(gps, () => lecturas++, () => errores++);
  t.after(detener);
  t.mock.timers.tick(10000);
  assert.equal(errores, 1);
  assert.equal(lecturas, 1);
});
