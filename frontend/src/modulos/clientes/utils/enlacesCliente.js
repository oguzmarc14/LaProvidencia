// Acepta enlaces compartidos desde Google Maps y sus dominios oficiales.
export function enlaceMaps(valor) {
  if (!valor?.trim()) return null;
  try {
    const url = new URL(valor.trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:") return null;
    if (host === "maps.app.goo.gl" || host === "goo.gl" || host === "maps.google.com" ||
        host === "www.google.com" || host === "google.com" ||
        /^maps\.google\.[a-z.]+$/.test(host) || /^www\.google\.[a-z.]+$/.test(host)) {
      return url.href;
    }
  } catch { /* No es un enlace válido. */ }
  return null;
}

export function enlaceWhatsApp(numero) {
  if (!numero?.trim()) return null;
  let digitos = numero.replace(/\D/g, "");
  if (digitos.length === 10) digitos = "52" + digitos; // México por defecto
  if (digitos.length < 11 || digitos.length > 15) return null;
  return "https://wa.me/" + digitos;
}
