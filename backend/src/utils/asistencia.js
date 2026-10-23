const zona = Object.freeze({
  latitud: 21.5224892,
  longitud: -102.246005,
  radioMetros: 100,
  precisionMaxima: 100,
  zonaHoraria: "America/Mexico_City",
  direccion: "Cuenca Lerma Santiago 26, Encarnación de Díaz, Jalisco",
});

function distanciaMetros(latitud, longitud) {
  const rad = (grados) => grados * Math.PI / 180;
  const a = Math.sin(rad(latitud - zona.latitud) / 2) ** 2 +
    Math.cos(rad(zona.latitud)) * Math.cos(rad(latitud)) *
    Math.sin(rad(longitud - zona.longitud) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

function fechaLocal(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zona.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find((parte) => parte.type === tipo).value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

module.exports = { zona, distanciaMetros, fechaLocal };
