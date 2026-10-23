import { solicitarApi } from "../../../services/api";
const solicitar = (ruta = "", opciones = {}) => solicitarApi("/api/clientes" + ruta, opciones);
export const obtenerClientes = () => solicitar();
export const crearCliente = (datos) => solicitar("", { method: "POST", body: JSON.stringify(datos) });
export const actualizarCliente = (id, datos) => solicitar("/" + id, { method: "PATCH", body: JSON.stringify(datos) });
