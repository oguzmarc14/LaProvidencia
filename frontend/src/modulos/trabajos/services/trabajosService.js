import { solicitarApi } from "../../../services/api";
const base="/api/trabajos";
export const obtenerTrabajos=()=>solicitarApi(base);
export const crearTrabajo=datos=>solicitarApi(base,{method:"POST",body:JSON.stringify(datos)});
export const actualizarTrabajo=(id,datos)=>solicitarApi(`${base}/${id}`,{method:"PATCH",body:JSON.stringify(datos)});
export const eliminarTrabajo=id=>solicitarApi(`${base}/${id}`,{method:"DELETE"});
