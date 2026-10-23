import { solicitarApi } from "../../../services/api";
const solicitar = (ruta = "", opciones = {}) => solicitarApi("/api/trabajos" + ruta, opciones);
export const obtenerTrabajos = () => solicitar();
export const crearTrabajo = (datos) => solicitar("", { method: "POST", body: JSON.stringify(datos) });
export const actualizarTrabajo = (id, datos) => solicitar("/" + id, { method: "PATCH", body: JSON.stringify(datos) });
export const eliminarTrabajo = (id) => solicitar("/" + id, { method: "DELETE" });
