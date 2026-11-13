import { solicitarApi } from "../../../services/api";

const solicitar = (ruta, opciones) =>
  solicitarApi(`/api/asistencias${ruta}`, { cache: "no-store", ...opciones });

export const obtenerZona = () => solicitar("/zona");
export const obtenerLlegadasHoy = () => solicitar("/hoy");
export const obtenerHistorial = (fecha, signal) => solicitar(`/historial?${new URLSearchParams({ fecha })}`, { signal });
export const registrarLlegada = (datos) => solicitar("/", {
  method: "POST", body: JSON.stringify(datos),
});
export const registrarSalida = (datos) => solicitar("/salida", {
  method: "POST", body: JSON.stringify(datos),
});

export const obtenerMisRegistros = (periodo, fecha, signal) => {
  const consulta = new URLSearchParams({ periodo });
  if (fecha) consulta.set("fecha", fecha);
  return solicitar(`/mis-registros?${consulta}`, { signal });
};
