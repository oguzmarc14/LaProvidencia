import { solicitarApi } from "../../../services/api";
const base="/api/registro-ventas";
export const crearRegistroVenta=datos=>solicitarApi(base,{method:"POST",body:JSON.stringify(datos)});
export const obtenerRegistrosVenta=()=>solicitarApi(base);
