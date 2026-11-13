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
  const accesos = opciones.filter(({ id }) => ["dashboard", "trabajadores", "trabajos", "asistencias"].includes(id));
  const enOtros = !accesos.some(({ id }) => id === actual);
  const estilo = activo => `flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[10px] font-bold ${activo ? "bg-[#124B91] text-white" : "text-[#124B91] hover:bg-blue-50"}`;

  return (
    <>
      <nav aria-label="Accesos móviles de administración"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 gap-1 border-t border-slate-200 bg-white/95 px-1 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur md:hidden">
        {accesos.map(({ id, nombre, icono: Icono }) => (
          <button key={id} type="button" aria-current={actual === id ? "page" : undefined}
            onClick={() => { navegar(id); window.scrollTo(0, 0); }} className={estilo(actual === id)}>
            <Icono size={20} aria-hidden="true" />
            {id === "dashboard" ? "Inicio" : nombre}
          </button>
        ))}
        <button type="button" aria-expanded={abierto} aria-controls="menu-administracion"
          onClick={abierto ? cerrar : abrir} className={estilo(enOtros || abierto)}>
          <Ellipsis size={20} aria-hidden="true" /> Más
        </button>
      </nav>
      {abierto && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/60 md:hidden"
          onClick={cerrar}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        id="menu-administracion"
        className={`fixed inset-y-0 left-0 z-40 w-68 md:flex flex-col text-white shadow-xl transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          abierto ? "flex translate-x-0" : "hidden md:flex"
        }`}
        style={{
          background:
            "linear-gradient(165deg,#fa484d 0%,#934467 36%,#453c72 64%,#09448d 100%)",
        }}
      >
        {/* Identidad visual */}
        <div className="border-b border-white/20 px-5 pb-6 pt-8">
          <div className="flex justify-end md:hidden">
            <button
              onClick={cerrar}
              aria-label="Cerrar menú"
              className="rounded-lg p-2 transition hover:bg-white/15"
            >
              <X size={20} />
            </button>
          </div>

          <BrandMark />
        </div>

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
