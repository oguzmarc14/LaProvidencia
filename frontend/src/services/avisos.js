export function avisar(tipo, titulo, mensaje) {
  window.dispatchEvent(new CustomEvent("sistema:aviso", { detail: { tipo, titulo, mensaje } }));
}
