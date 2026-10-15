const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function obtenerResumenDashboard() {
  const respuesta = await fetch(`${API_URL}/api/dashboard/resumen`);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || "No se pudo cargar el dashboard");
  return datos;
}
