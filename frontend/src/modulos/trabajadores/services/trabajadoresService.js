import { solicitarApi } from "../../../services/api";

const solicitar = (ruta = "", opciones = {}) => solicitarApi(`/api/trabajadores${ruta}`, opciones);

export const obtenerTrabajadores = () => solicitar();
export const crearTrabajador = (datos) =>
  solicitar("", { method: "POST", body: JSON.stringify(datos) });
export const actualizarTrabajador = (id, datos) =>
  solicitar(`/${id}`, { method: "PATCH", body: JSON.stringify(datos) });
export const obtenerTrabajosDeTrabajador = (id) => solicitar(`/${id}/trabajos`);
