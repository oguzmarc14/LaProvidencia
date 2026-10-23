const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api/clientes";
async function solicitar(ruta = "", opciones = {}) {
  const respuesta = await fetch(API_URL + ruta, { ...opciones, headers: { "Content-Type": "application/json", ...opciones.headers } });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || datos.message || "Error al consultar clientes");
  return datos;
}
export const obtenerClientes = () => solicitar();
export const crearCliente = (datos) => solicitar("", { method: "POST", body: JSON.stringify(datos) });
export const actualizarCliente = (id, datos) => solicitar("/" + id, { method: "PATCH", body: JSON.stringify(datos) });

export const eliminarCliente = id => solicitar("/" + id, { method: "DELETE" });
