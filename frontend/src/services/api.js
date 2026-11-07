const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim().replace(/\/+$/, "");
const TOKEN_KEY = "laprovidencia_token";
export const obtenerToken = () => localStorage.getItem(TOKEN_KEY);
export const guardarToken = token => localStorage.setItem(TOKEN_KEY, token);
export const cerrarSesionLocal = () => localStorage.removeItem(TOKEN_KEY);

export async function solicitarApi(ruta, opciones = {}) {
  const headers = new Headers(opciones.headers || {});
  if (opciones.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = obtenerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let respuesta;
  try { respuesta = await fetch(`${BASE}${ruta}`, { ...opciones, headers }); }
  catch { throw new Error("No se pudo conectar con el servidor."); }
  const datos = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 401 && token && !["/api/auth/login", "/api/auth/change-password"].includes(ruta)) {
    cerrarSesionLocal();
    window.dispatchEvent(new Event("auth:expired"));
  }
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || datos.message || "No se pudo completar la solicitud.");
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}
