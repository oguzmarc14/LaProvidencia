import {
  BadgeCheck, Bath, Building2, CalendarDays, CookingPot, Diamond, Handshake, HardHat,
  Layers3, MessageSquareText, PanelsTopLeft, Ruler, Settings, ShieldCheck, Truck, Wrench,
} from "lucide-react";
import cocina from "./fotos/cocina-marmol.jpg";
import lavabo from "./fotos/lavabo-marmol.jpg";
import granito from "./fotos/cocina-granito.jpg";

export const telefono = "475 103 8509";
export const enlaceWhatsApp = (mensaje) => `https://wa.me/524751038509?text=${encodeURIComponent(mensaje)}`;
export const cotizar = enlaceWhatsApp("Hola, me gustaría solicitar una cotización para mi proyecto de mármol, granito o cuarzo.");

export const navegacion = [
  ["inicio", "Inicio"], ["servicios", "Servicios"], ["proyectos", "Proyectos"],
  ["nosotros", "Nosotros"], ["contacto", "Contacto"],
];
export const atributos = [
  [ShieldCheck, "Calidad y durabilidad"], [Wrench, "Fabricación a medida"],
  [CalendarDays, "Instalación profesional"], [Handshake, "Atención personalizada"],
];
export const servicios = [
  [CookingPot, "Encimeras de cocina"], [Bath, "Encimeras de baño"], [PanelsTopLeft, "Cubiertas y barras"],
  [Layers3, "Proyectos residenciales"], [Building2, "Proyectos comerciales"],
];
export const proyectos = [
  { foto: cocina, titulo: "Isla de cocina en mármol claro" },
  { foto: lavabo, titulo: "Lavabo con cubierta de mármol" },
  { foto: granito, titulo: "Isla de cocina en granito negro" },
];
export const ventajas = [
  [Diamond, "Materiales premium", "Mármol, granito y cuarzo para distintos usos y estilos."],
  [Ruler, "Medidas personalizadas", "Cubiertas fabricadas para las dimensiones de tu espacio."],
  [HardHat, "Instalación experta", "Colocación, nivelación y acabado a cargo de nuestro equipo."],
  [BadgeCheck, "Respaldo y confianza", "Acompañamiento desde la selección del material hasta la instalación."],
];
export const proceso = [
  [MessageSquareText, "Contáctanos", "Cuéntanos tu idea, tus necesidades y las medidas de tu espacio."],
  [Layers3, "Asesoría y diseño", "Te ayudamos a elegir los materiales, acabados y diseño para tu proyecto."],
  [Settings, "Fabricación", "Fabricamos tu encimera a medida y cuidamos la precisión de cada corte."],
  [Truck, "Instalación", "Colocamos tu cubierta y revisamos el nivel y los acabados."],
];
export const testimonios = [
  { nombre: "María G.", tipo: "Proyecto residencial", comentario: "El acabado de la encimera y la instalación cuidaron cada detalle.", calificacion: 5 },
  { nombre: "Carlos R.", tipo: "Proyecto comercial", comentario: "Nos asesoraron para elegir el material y coordinar la instalación.", calificacion: 5 },
];
