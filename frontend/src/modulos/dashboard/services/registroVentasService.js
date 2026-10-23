const BASE=(import.meta.env.VITE_API_URL||"http://localhost:3000")+"/api/registro-ventas";
async function solicitar(ruta="",opciones={}){
 const r=await fetch(BASE+r,{...opciones,headers:{"Content-Type":"application/json",...opciones.headers}});
 const datos=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(datos.mensaje||"Error al procesar el registro de venta");
 return datos;
}
export const crearRegistroVenta=datos=>solicitar("",{method:"POST",body:JSON.stringify(datos)});
export const obtenerRegistrosVenta=()=>solicitar();
