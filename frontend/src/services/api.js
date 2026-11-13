import { avisar } from "./avisos";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim().replace(/\/+$/, "");
const TOKEN_KEY = "laprovidencia_token";
export const obtenerToken = () => localStorage.getItem(TOKEN_KEY);
export const guardarToken = token => localStorage.setItem(TOKEN_KEY, token);
export const cerrarSesionLocal = () => localStorage.removeItem(TOKEN_KEY);

export async function solicitarApi(ruta, opciones = {}, { usarSesion = true } = {}) {
  const metodo = opciones.method ?? "GET";
  const avisos = {
    "POST /api/auth/login": "Sesión iniciada",
    "POST /api/auth/change-password": "Contraseña actualizada",
    "POST /api/auth/users": "Acceso creado",
    "PATCH /api/auth/users/:id/password": "Contraseña restablecida",
    "POST /api/asistencias/": "Entrada registrada",
    "POST /api/asistencias/salida": "Salida registrada",
    "POST /api/catalogo/admin/productos": "Producto creado",
    "PUT /api/catalogo/admin/productos/:id": "Producto actualizado",
  };
  const clave = ruta.replace(/\/[a-f0-9]{24}(?=\/|$)/gi, "/:id");
  const exito = avisos[metodo + " " + clave];
  const errorVisible = exito || (usarSesion && metodo === "GET" && !opciones.signal && ruta !== "/api/auth/me");
  const headers = new Headers(opciones.headers || {});
  if (opciones.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = usarSesion ? obtenerToken() : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let respuesta;
  try { respuesta = await fetch(`${BASE}${ruta}`, { ...opciones, headers }); }
  catch (causa) {
    if (causa.name === "AbortError") throw causa;
    const mensaje = "No se pudo conectar con el servidor.";
    if (errorVisible) avisar("error", "Error de conexión", mensaje);
    throw new Error(mensaje);
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 401 && token && !["/api/auth/login", "/api/auth/change-password"].includes(ruta)) {
    avisar("error", "Sesión vencida", "Vuelve a iniciar sesión.");
    cerrarSesionLocal();
    window.dispatchEvent(new Event("auth:expired"));
  }
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || datos.message || "No se pudo completar la solicitud.");
    error.status = respuesta.status;
    if (errorVisible && (respuesta.status !== 401 || !token || ruta === "/api/auth/change-password" || ruta === "/api/auth/login")) avisar("error", "No se pudo completar la solicitud", error.message);
    throw error;
  }
  if (exito) avisar("success", exito);
  return datos;
}
