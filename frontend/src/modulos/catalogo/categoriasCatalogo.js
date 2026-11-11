export const apartadosCatalogo = [
  { id: "cubiertas", nombre: "Cubiertas", descripcion: "Granitos, mármoles, cuarzos, cuarcitas y porcelanatos para tus cubiertas.", categorias: ["Granito", "Mármoles", "Cuarzos", "Cuarcitas", "Porcelanatos", "Cubiertas y barras"] },
  { id: "acabados", nombre: "Acabados", descripcion: "Fachaletas, canteras y lajas para dar carácter a tus espacios.", categorias: ["Fachaletas", "Canteras", "Lajas", "Pisos"] },
  { id: "accesorios", nombre: "Accesorios", descripcion: "Tarjas, llaves o monomandos, campanas y parrillas.", categorias: ["Tarjas", "Llaves o monomandos", "Campanas", "Parrillas"] },
  { id: "banos", nombre: "Baños", descripcion: "Ovalines y monomandos para completar tu baño.", categorias: ["Ovalines", "Monomandos para baño", "Accesorios de baño", "Canceles y mamparas", "Espejos"] },
  { id: "otros-productos", nombre: "Otros productos", descripcion: "Más soluciones para tu proyecto.", categorias: ["Vidrio", "Lápidas", "Otros"] },
];

// Conserva el valor histórico de Granito para que los productos existentes sigan visibles.
export const nombreCategoria = categoria => categoria === "Granito" ? "Granitos" : categoria;
export const categorias = apartadosCatalogo.flatMap(apartado => apartado.categorias);
