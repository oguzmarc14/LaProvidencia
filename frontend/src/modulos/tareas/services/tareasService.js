
import { solicitarApi } from "../../../services/api";

const RUTA = "/api/tareas";

// Obtener todas las tareas
export const obtenerTareas = () => {
  return solicitarApi(RUTA);
};

// Crear una tarea
export const crearTarea = (datos) => {
  return solicitarApi(RUTA, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Actualizar una tarea
export const actualizarTarea = (id, datos) => {
  return solicitarApi(`${RUTA}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
};

// Eliminar una tarea
export const eliminarTarea = (id) => {
  return solicitarApi(`${RUTA}/${id}`, {
    method: "DELETE",
  });
};
