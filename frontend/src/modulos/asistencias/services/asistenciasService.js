const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}/api/asistencias${ruta}`, {
    cache: "no-store",
    ...opciones,
    headers: { "Content-Type": "application/json" },
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || "No se pudo consultar la asistencia");
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}

export const obtenerZona = () => solicitar("/zona");
export const obtenerLlegadasHoy = () => solicitar("/hoy");
export const registrarLlegada = (datos) => solicitar("/", {
  method: "POST", body: JSON.stringify(datos),
});
