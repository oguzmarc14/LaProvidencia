import { cerrarSesionLocal, guardarToken, solicitarApi } from "./api";

export async function iniciarSesion(identificador, password) {
  const datos = await solicitarApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identificador, password }),
  });
  if (!datos.token || !datos.usuario) throw new Error("Respuesta de autenticación no válida.");
  guardarToken(datos.token);
  return datos.usuario;
}

export async function obtenerSesion() {
  const datos = await solicitarApi("/api/auth/me");
  return datos.usuario;
}

export async function cerrarSesion() {
  cerrarSesionLocal();
}

export async function crearUsuario(email, password, trabajador) {
  const datos = await solicitarApi("/api/auth/users", {
    method: "POST",
    body: JSON.stringify({ email, password, trabajador }),
  });
  return datos.usuario;
}

export async function obtenerUsuarios() {
  const datos = await solicitarApi("/api/auth/users");
  return datos.usuarios;
}

export async function cambiarContrasenaUsuario(id, password) {
  const datos = await solicitarApi(`/api/auth/users/${encodeURIComponent(id)}/password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
  return datos.usuario;
}

export async function cambiarContrasena(contrasenaActual, contrasenaNueva) {
  const datos = await solicitarApi("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ contrasenaActual, contrasenaNueva }),
  });
  if (datos.token) guardarToken(datos.token);
  return datos.usuario;
}
