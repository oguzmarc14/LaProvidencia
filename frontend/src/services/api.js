const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "laprovidencia_token";

export const obtenerToken = () => localStorage.getItem(TOKEN_KEY);

export const guardarToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const eliminarToken = () => localStorage.removeItem(TOKEN_KEY);

export async function solicitarApi(ruta, opciones = {}) {
  const headers = new Headers(opciones.headers || {});
  if (!headers.has("Content-Type") && opciones.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = obtenerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const respuesta = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });
  const datos = await respuesta.json().catch(() => ({}));

  if (
    respuesta.status === 401 &&
    token &&
    !["/api/auth/login", "/api/auth/change-password"].includes(ruta)
  ) {
    eliminarToken();
    window.dispatchEvent(new Event("auth:expired"));
  }
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || datos.message || "No se pudo completar la solicitud");
  }
  return datos;
}
