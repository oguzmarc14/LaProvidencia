import { solicitarApi, guardarToken, cerrarSesionLocal } from "./api";

export const iniciarSesion = async (identificador, password) => {
  const datos = await solicitarApi("/api/auth/login", {
    method: "POST", body: JSON.stringify({ identificador, password })
  });
  if (!datos.token || !datos.usuario) throw new Error("Respuesta de autenticación no válida.");
  guardarToken(datos.token);
  return datos.usuario;
};
export const consultarSesion = async () => (await solicitarApi("/api/auth/me")).usuario;
export const cerrarSesion = cerrarSesionLocal;
