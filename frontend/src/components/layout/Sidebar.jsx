import {
  LayoutDashboard,
  Users,
  UserRoundCheck,
  X,
  BriefcaseBusiness,
  FileText,
  ClipboardList,
  Clock,
  BookOpen,
  Package,
  CalendarDays,
  Ellipsis,
} from "lucide-react";

import BrandMark from "../BrandMark";

const opciones = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    icono: LayoutDashboard,
  },
  {
    id: "clientes",
    nombre: "Clientes",
    icono: Users,
  },
  {
    id: "trabajadores",
    nombre: "Trabajadores",
    icono: UserRoundCheck,
  },
  {
    id: "trabajos",
    nombre: "Trabajos",
    icono: BriefcaseBusiness,
  },
  {
    id: "ventas",
    nombre: "Lápidas",
    icono: FileText,
  },
  {
    id: "tareas",
    nombre: "Tareas",
    icono: ClipboardList,
  },
  {
    id: "asistencias",
    nombre: "Asistencia",
    icono: Clock,
  },
  { id: "calendario", nombre: "Calendario", icono: CalendarDays },
  { id: "productos", nombre: "Productos", icono: Package },
  { id: "catalogo", nombre: "Catálogo", icono: BookOpen },
];

export default function Sidebar({
  actual,
  navegar,
  abierto,
  cerrar,
  abrir,
}) {
  const estilo = activo => `flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[10px] font-bold ${activo ? "bg-[#124B91] text-white" : "text-[#124B91] hover:bg-blue-50"}`;

  return (
    <>
      <nav aria-label="Accesos móviles de administración"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-1 border-t border-slate-200 bg-white/95 px-1 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur md:hidden">
        <div className="flex min-w-0 flex-1 snap-x gap-1 overflow-x-auto overscroll-x-contain pb-1">
        {opciones.map(({ id, nombre, icono: Icono }) => (
          <button key={id} type="button" aria-current={actual === id ? "page" : undefined}
            onClick={() => { navegar(id); window.scrollTo(0, 0); }} className={estilo(actual === id) + " w-[4.75rem] shrink-0 snap-start"}>
            <Icono size={20} aria-hidden="true" />
            {id === "dashboard" ? "Inicio" : nombre}
          </button>
        ))}
        </div>
        <button type="button" aria-expanded={abierto} aria-controls="menu-administracion"
          onClick={abierto ? cerrar : abrir} className={estilo(abierto) + " w-16 shrink-0"}>
          <Ellipsis size={20} aria-hidden="true" /> Ver más
        </button>
      </nav>
      {abierto && (
        <>
          <button type="button" className="fixed inset-0 z-20 bg-slate-950/50 md:hidden" onClick={cerrar} aria-label="Cerrar menú" />
          <section id="menu-administracion" aria-label="Todas las secciones"
            onKeyDown={evento => { if (evento.key === "Escape") cerrar(); }}
            className="fixed inset-x-0 bottom-[calc(3.75rem+max(.5rem,env(safe-area-inset-bottom)))] z-30 rounded-t-3xl border border-blue-100 max-h-[65dvh] overflow-y-auto bg-white p-4 shadow-xl md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-extrabold text-[#203d6b]">Secciones</h2>
              <button type="button" aria-label="Cerrar secciones" onClick={cerrar} className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-800"><X size={18}/></button>
            </div>
            <nav aria-label="Secciones del sistema" className="grid grid-cols-3 gap-2">
              {opciones.map(({ id, nombre, icono: Icono }) => (
                <button key={id} type="button" aria-current={id === actual ? "page" : undefined}
                  onClick={() => { navegar(id); cerrar(); window.scrollTo(0, 0); }}
                  className={estilo(id === actual) + " min-h-16 w-full border border-blue-100"}>
                  <Icono size={21} aria-hidden="true" />{nombre}
                </button>
              ))}
            </nav>
          </section>
        </>
      )}

      <aside className="sticky top-0 hidden h-screen w-68 flex-col text-white shadow-xl md:flex"
        style={{ background: "linear-gradient(165deg,#fa484d 0%,#934467 36%,#453c72 64%,#09448d 100%)" }}>
        <div className="border-b border-white/20 px-5 pb-6 pt-8"><BrandMark /></div>

        {/* Navegación */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Navegación principal"
        >
          <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-widest text-white/60">
            Administración
          </p>

          {opciones.map(
            ({ id, nombre, icono: Icono }) => (
              <button
                key={id}
                onClick={() => {
                  navegar(id);
                  cerrar();
                }}
                aria-current={actual === id ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  actual === id
                    ? "bg-white text-[#273f7c] shadow-md"
                    : "text-white/90 hover:bg-white/15"
                }`}
              >
                <Icono size={19} />
                {nombre}
              </button>
            )
          )}
        </nav>

        {/* Pie del menú */}
        <p className="border-t border-white/15 px-5 py-4 text-xs text-white/70">
          Sistema de organización
        </p>
      </aside>
    </>
  );
}
