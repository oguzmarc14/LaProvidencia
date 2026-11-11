import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight, ChevronLeft, ChevronRight, Clock, Menu, MessageCircle, Star, UserRound, X,
} from "lucide-react";
import logo from "../../public/logo-providencia.png";
import { atributos, cotizar, navegacion, proceso, proyectos, servicios, telefono, testimonios, ventajas } from "./datosSitio";
import "./catalogoClientes.css";

function Marca() {
  return (
    <a className="lp-marca" href="#inicio">
      <img src={logo} width="52" height="52" alt="" />
      <span><strong>La Providencia</strong><small>Encimeras de Mármol y Granito</small></span>
    </a>
  );
}

function WhatsApp({ children, className = "" }) {
  return <a className={`lp-boton ${className}`} href={cotizar} target="_blank" rel="noreferrer"><MessageCircle size={19} aria-hidden="true" />{children}</a>;
}

function Navbar() {
  const [abierto, setAbierto] = useState(false);
  return (
    <header className="lp-header lp-degradado">
      <div className="lp-ancho lp-navbar" onKeyDown={(e) => { if (e.key === "Escape") setAbierto(false); }}>
        <Marca />
        <button type="button" className="lp-menu" aria-controls="lp-navegacion" aria-expanded={abierto} aria-label={abierto ? "Cerrar menú" : "Abrir menú"} onClick={() => setAbierto(!abierto)}>
          {abierto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="lp-navegacion" aria-label="Navegación principal" className={abierto ? "lp-nav lp-nav-abierto" : "lp-nav"}>
          {navegacion.map(([id, nombre]) => <a key={id} href={`#${id}`} onClick={() => setAbierto(false)}>{nombre}</a>)}
          <WhatsApp className="lp-boton-claro">Contáctanos</WhatsApp>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="lp-hero lp-degradado" aria-labelledby="lp-titulo">
      <img className="lp-hero-foto" src={proyectos[0].foto} alt="" fetchPriority="high" />
      <div className="lp-ancho lp-hero-contenido">
        <p className="lp-etiqueta">Mármol · Granito · Cuarzo</p>
        <h1 id="lp-titulo"><span>Encimeras de</span> <span>Mármol y Granito</span> <span>La Providencia</span></h1>
        <p className="lp-hero-descripcion">Fabricación e instalación de encimeras y superficies en piedra natural y engineered stone, con la calidad y precisión que tu proyecto necesita.</p>
        <div className="lp-acciones">
          <WhatsApp className="lp-boton-coral">Solicita una cotización</WhatsApp>
          <a className="lp-boton lp-boton-linea" href="#proyectos">Ver proyectos <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
        <ul className="lp-atributos">
          {atributos.map(([Icono, titulo]) => <li key={titulo}><Icono size={27} aria-hidden="true" /><span>{titulo}</span></li>)}
        </ul>
      </div>
    </section>
  );
}

function Galeria() {
  const [inicio, setInicio] = useState(0);
  const [ampliada, setAmpliada] = useState(null);
  const reducirMovimiento = useReducedMotion();
  const dialogo = useRef(null);
  const siguiente = (i, paso) => (i + paso + proyectos.length) % proyectos.length;
  useEffect(() => {
    if (ampliada !== null && !dialogo.current.open) dialogo.current.showModal();
  }, [ampliada]);

  return (
    <section id="proyectos" className="lp-proyectos lp-degradado" aria-labelledby="lp-proyectos-titulo">
      <div className="lp-ancho lp-proyectos-grid">
        <div>
          <p className="lp-etiqueta">Proyectos destacados</p>
          <h2 id="lp-proyectos-titulo">Conoce nuestro trabajo</h2>
          <p>Ideas para encimeras, cocinas y baños en mármol y granito.</p>
          <a className="lp-boton lp-boton-linea" href="/catalogo">Ver catálogo <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="lp-galeria" aria-roledescription="carrusel" aria-label="Galería de inspiración">
          <motion.div key={inicio} className="lp-galeria-fotos" initial={reducirMovimiento ? false : { opacity: 0.78 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
            {proyectos.map((_, posicion) => {
              const i = siguiente(inicio, posicion);
              return <button key={i} type="button" className="lp-foto-boton" onClick={() => setAmpliada(i)} aria-label={`Ampliar: ${proyectos[i].titulo}`}><img src={proyectos[i].foto} alt="" loading="lazy" /></button>;
            })}
          </motion.div>
          <button className="lp-galeria-flecha lp-galeria-anterior" type="button" aria-label="Proyecto anterior" onClick={() => setInicio(siguiente(inicio, -1))}><ChevronLeft aria-hidden="true" /></button>
          <button className="lp-galeria-flecha lp-galeria-siguiente" type="button" aria-label="Proyecto siguiente" onClick={() => setInicio(siguiente(inicio, 1))}><ChevronRight aria-hidden="true" /></button>
          <div className="lp-galeria-pie">
            <div className="lp-indicadores">
              {proyectos.map(({ titulo }, i) => <button key={titulo} type="button" aria-current={inicio === i ? "true" : undefined} aria-label={`Ir a ${titulo}`} onClick={() => setInicio(i)} />)}
            </div>
            <small>Imágenes ilustrativas</small>
          </div>
        </div>
      </div>
      <dialog ref={dialogo} className="lp-dialogo" aria-label="Imagen ampliada" onClose={() => setAmpliada(null)} onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") setAmpliada((i) => siguiente(i, e.key === "ArrowLeft" ? -1 : 1));
      }}>
        {ampliada !== null && (
          <>
            <button className="lp-dialogo-cerrar" type="button" onClick={() => dialogo.current.close()} aria-label="Cerrar imagen"><X aria-hidden="true" /></button>
            <img src={proyectos[ampliada].foto} alt={proyectos[ampliada].titulo} />
            <div className="lp-dialogo-pie">
              <button type="button" aria-label="Imagen anterior" onClick={() => setAmpliada(siguiente(ampliada, -1))}><ChevronLeft aria-hidden="true" /></button>
              <p>{proyectos[ampliada].titulo} · Imagen ilustrativa</p>
              <button type="button" aria-label="Imagen siguiente" onClick={() => setAmpliada(siguiente(ampliada, 1))}><ChevronRight aria-hidden="true" /></button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}

function Footer() {
  const redes = [
    ["Facebook", import.meta.env.VITE_PROVIDENCIA_FACEBOOK],
    ["Instagram", import.meta.env.VITE_PROVIDENCIA_INSTAGRAM],
    ["TikTok", import.meta.env.VITE_PROVIDENCIA_TIKTOK],
  ].filter(([, url]) => /^https:\/\//i.test(url || ""));
  return (
    <footer className="lp-footer lp-degradado">
      <div className="lp-ancho lp-footer-grid">
        <Marca />
        <nav aria-label="Enlaces del pie de página">
          <strong>Enlaces</strong>
          {navegacion.map(([id, nombre]) => <a key={id} href={`#${id}`}>{nombre}</a>)}
          <a href="/catalogo">Catálogo</a>
        </nav>
        <div><strong><Clock size={17} aria-hidden="true" /> Horario</strong><p>Lunes a viernes</p><p>9:00 a. m. – 3:00 p. m.</p><p>4:00 p. m. – 7:00 p. m.</p></div>
        <div><strong>Contacto</strong><a href={cotizar} target="_blank" rel="noreferrer">WhatsApp · {telefono}</a>
          {redes.length > 0 && <div className="lp-redes">{redes.map(([red, url]) => <a key={red} href={url} target="_blank" rel="noreferrer">{red}</a>)}</div>}
        </div>
      </div>
    </footer>
  );
}

export default function PortadaProvidencia({ children }) {
  return (
    <div id="inicio" className="lp-sitio">
      <a className="lp-saltar" href="#servicios">Saltar al contenido</a>
      <Navbar />
      <main>
        <Hero />
        <section id="servicios" className="lp-ancho lp-servicios" aria-labelledby="lp-servicios-titulo">
          <p className="lp-etiqueta">Nuestros servicios</p>
          <h2 id="lp-servicios-titulo">Soluciones en Piedra Natural</h2>
          <ul className="lp-servicios-grid">
            {servicios.map(([Icono, titulo]) => <li className="lp-tarjeta" key={titulo}><Icono size={42} strokeWidth={1.5} aria-hidden="true" /><h3>{titulo}</h3></li>)}
          </ul>
        </section>
        <Galeria />
        <section id="nosotros" className="lp-ancho lp-nosotros" aria-labelledby="lp-nosotros-titulo">
          <h2 className="lp-titulo-lineas" id="lp-nosotros-titulo">¿Por qué elegirnos?</h2>
          <ul className="lp-ventajas">
            {ventajas.map(([Icono, titulo, texto]) => <li className="lp-tarjeta" key={titulo}><span><Icono size={34} strokeWidth={1.6} aria-hidden="true" /></span><h3>{titulo}</h3><p>{texto}</p></li>)}
          </ul>
        </section>
        <section className="lp-ancho" aria-labelledby="lp-proceso-titulo">
          <div className="lp-proceso lp-degradado">
            <div><h2 id="lp-proceso-titulo">Nuestro proceso de trabajo</h2><p>Te acompañamos en cada paso para llevar tu proyecto de la idea a la realidad.</p></div>
            <ol>
              {proceso.map(([Icono, texto], i) => <li key={texto}><span className="lp-paso-numero">{i + 1}</span><Icono size={33} strokeWidth={1.6} aria-hidden="true" /><p>{texto}</p>{i < proceso.length - 1 && <ChevronRight className="lp-conector" size={18} aria-hidden="true" />}</li>)}
            </ol>
          </div>
        </section>
        <section className="lp-ancho lp-testimonios" aria-labelledby="lp-testimonios-titulo">
          <div><p className="lp-etiqueta">Testimonios</p><h2 id="lp-testimonios-titulo">La confianza de nuestros clientes</h2><p>Ejemplos de cómo se mostrarán las reseñas verificadas.</p></div>
          {testimonios.map(({ nombre, tipo, comentario, calificacion }) => (
            <figure className="lp-tarjeta lp-resena" key={nombre}>
              <div className="lp-estrellas" aria-label={`${calificacion} de 5 estrellas`}>{Array.from({ length: calificacion }, (_, i) => <Star key={i} size={16} fill="currentColor" aria-hidden="true" />)}</div>
              <blockquote>“{comentario}”</blockquote>
              <figcaption><UserRound size={21} aria-hidden="true" /><span><strong>{nombre}</strong><small>{tipo} · Demostración</small></span></figcaption>
            </figure>
          ))}
        </section>
        {children}
        <section id="contacto" className="lp-ancho" aria-labelledby="lp-contacto-titulo">
          <div className="lp-contacto lp-degradado">
            <img src={proyectos[0].foto} alt="" loading="lazy" />
            <div><h2 id="lp-contacto-titulo">Solicita tu cotización</h2><p>Convierte tu espacio con encimeras de mármol, granito o cuarzo. ¡Contáctanos hoy!</p></div>
            <WhatsApp className="lp-boton-coral lp-telefono">{telefono}</WhatsApp>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
