import { solicitarApi } from "../../services/api";

export { categorias, apartadosCatalogo, nombreCategoria } from "./categoriasCatalogo";
export const unidades = ["pieza", "metro lineal", "m²"];
export const estados = ["borrador", "publicado", "oculto"];
export const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
export const enlaceCatalogo = () => new URL("?catalogo=1", window.location.origin).href;

export const catalogoAdmin = (ruta, method = "GET", datos) => solicitarApi("/api/catalogo/admin" + ruta, {
  method, body: datos === undefined ? undefined : JSON.stringify(datos),
});

export function catalogoClientes(ruta, opciones) {
  return solicitarApi("/api/catalogo" + ruta, opciones, { usarSesion: false });
}
