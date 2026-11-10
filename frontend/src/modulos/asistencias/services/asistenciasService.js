import { solicitarApi } from "../../../services/api";

const solicitar = (ruta, opciones) =>
  solicitarApi(`/api/asistencias${ruta}`, { cache: "no-store", ...opciones });

export const obtenerZona = () => solicitar("/zona");
export const obtenerLlegadasHoy = () => solicitar("/hoy");
export const registrarLlegada = (datos) => solicitar("/", {
  method: "POST", body: JSON.stringify(datos),
});
export const registrarSalida = (datos) => solicitar("/salida", {
  method: "POST", body: JSON.stringify(datos),
});
