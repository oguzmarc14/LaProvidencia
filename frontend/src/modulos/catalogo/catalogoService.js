import { solicitarApi } from "../../services/api";

export { categorias, apartadosCatalogo, nombreCategoria } from "./categoriasCatalogo";
export const unidades = ["pieza", "metro lineal", "m²"];
export const estados = ["borrador", "publicado", "oculto"];
export const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
export const enlaceCatalogo = () => {
  const origen = window.location.hostname === "laprovidencia-marco.vercel.app"
    ? "https://marmolesygranitoslaprovidencia.vercel.app"
    : window.location.origin;
  return new URL("/catalogo", origen).href;
};

export const catalogoAdmin = (ruta, method = "GET", datos) => solicitarApi("/api/catalogo/admin" + ruta, {
  method, body: datos === undefined ? undefined : JSON.stringify(datos),
});

export function catalogoClientes(ruta, opciones) {
  return solicitarApi("/api/catalogo" + ruta, opciones, { usarSesion: false });
}
