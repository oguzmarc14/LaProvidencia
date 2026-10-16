const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function solicitar(ruta = "", opciones = {}) {
  const respuesta = await fetch(`${API_URL}/api/trabajadores${ruta}`, {
    ...opciones,
    headers: { "Content-Type": "application/json", ...opciones.headers },
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || "Error al consultar trabajadores");
  return datos;
}

export const obtenerTrabajadores = () => solicitar();
export const crearTrabajador = (datos) =>
  solicitar("", { method: "POST", body: JSON.stringify(datos) });
export const actualizarTrabajador = (id, datos) =>
  solicitar(`/${id}`, { method: "PATCH", body: JSON.stringify(datos) });
export const obtenerTrabajosDeTrabajador = (id) => solicitar(`/${id}/trabajos`);
