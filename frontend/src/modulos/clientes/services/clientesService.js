import { solicitarApi } from "../../../services/api";
const base="/api/clientes";
export const obtenerClientes=()=>solicitarApi(base);
export const crearCliente=datos=>solicitarApi(base,{method:"POST",body:JSON.stringify(datos)});
export const actualizarCliente=(id,datos)=>solicitarApi(`${base}/${id}`,{method:"PATCH",body:JSON.stringify(datos)});
export const eliminarCliente=id=>solicitarApi(`${base}/${id}`,{method:"DELETE"});
