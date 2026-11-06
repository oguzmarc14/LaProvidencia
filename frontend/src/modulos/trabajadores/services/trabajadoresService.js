import { solicitarApi } from "../../../services/api";
const base="/api/trabajadores";
export const obtenerTrabajadores=()=>solicitarApi(base);
export const crearTrabajador=datos=>solicitarApi(base,{method:"POST",body:JSON.stringify(datos)});
export const actualizarTrabajador=(id,datos)=>solicitarApi(`${base}/${id}`,{method:"PATCH",body:JSON.stringify(datos)});
export const obtenerTrabajosDeTrabajador=id=>solicitarApi(`${base}/${id}/trabajos`);
