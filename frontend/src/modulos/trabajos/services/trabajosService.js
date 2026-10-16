const API = (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api/trabajos";
async function solicitar(ruta = "", opciones = {}) {
  const respuesta = await fetch(API + ruta, { ...opciones, headers: { "Content-Type": "application/json", ...opciones.headers } });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || "No se pudo completar la solicitud");
  return datos;
}
export const obtenerTrabajos = () => solicitar();
export const crearTrabajo = (datos) => solicitar("", { method: "POST", body: JSON.stringify(datos) });
export const actualizarTrabajo = (id, datos) => solicitar("/" + id, { method: "PATCH", body: JSON.stringify(datos) });
export const eliminarTrabajo = (id) => solicitar("/" + id, { method: "DELETE" });
