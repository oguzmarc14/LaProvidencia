import { solicitarApi } from "../../../services/api";
const base="/api/tareas";
export const obtenerTareas=()=>solicitarApi(base);
export const crearTarea=datos=>solicitarApi(base,{method:"POST",body:JSON.stringify(datos)});
export const actualizarTarea=(id,datos)=>solicitarApi(`${base}/${id}`,{method:"PATCH",body:JSON.stringify(datos)});
export const eliminarTarea=id=>solicitarApi(`${base}/${id}`,{method:"DELETE"});
