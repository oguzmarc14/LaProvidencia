const API_URL = "http://localhost:3000/api/cllientes";

export const obtenerClientes = async () => {
    const respuesta = await fetch(API_URL);

    if(!respuesta.ok){
        throw new Error("No se pudieron obtener los clientes")
    }

    const datos = await respuesta.json();

    return datos
}