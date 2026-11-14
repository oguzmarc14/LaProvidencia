const tiposImagen = ["image/jpeg", "image/png", "image/webp"];
const normalizarCategoria = texto => texto.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const maxBytes = 400 * 1024;
const leerImagen = (archivo) => new Promise((resolve, reject) => {
  const lector = new FileReader();
  lector.onload = () => resolve(lector.result);
  lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
  lector.readAsDataURL(archivo);
});

export async function prepararFoto(archivo) {
  if (!tiposImagen.includes(archivo.type)) {
    throw new Error(`La foto «${archivo.name}» debe ser JPG, PNG o WebP.`);
  }

  if (archivo.size > 10 * 1024 * 1024) throw new Error("Selecciona una imagen de hasta 10 MB.");

  let imagen;
  try {
    imagen = await createImageBitmap(archivo);
  } catch {
    throw new Error(`No se pudo abrir la foto «${archivo.name}».`);
  }

  try {
    if (archivo.type === "image/webp" && archivo.size <= maxBytes) return await leerImagen(archivo);
    const lienzo = document.createElement("canvas");
    const contexto = lienzo.getContext("2d");
    if (!contexto) throw new Error("El navegador no pudo preparar la foto.");
    for (const lado of [1600, 1200, 800, 480]) {
      const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height));
      lienzo.width = Math.max(1, Math.round(imagen.width * escala));
      lienzo.height = Math.max(1, Math.round(imagen.height * escala));
      contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      const comprimida = await new Promise((resolve) => lienzo.toBlob(resolve, "image/webp", 0.82));
      if (comprimida?.type !== "image/webp") {
        throw new Error("Este navegador no pudo convertir la foto a WebP.");
      }
      if (comprimida.size <= maxBytes) return await leerImagen(comprimida);
    }
    throw new Error(`No se pudo reducir la foto «${archivo.name}» al tamaño permitido.`);
  } finally {
    imagen.close();
  }
}

