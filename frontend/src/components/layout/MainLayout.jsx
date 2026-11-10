import { useEffect, useState } from "react";
import {
  Menu,
  LogOut,
  ShieldCheck,
  ChevronRight,
  CalendarClock,
  Bell,
  RefreshCw,
} from "lucide-react";

import Sidebar from "./Sidebar";
import { obtenerTareas } from "../../modulos/tareas/services/tareasService";

const nombres = {
  dashboard: "Panel principal",
  clientes: "Gestión de clientes",
  trabajadores: "Gestión de trabajadores",
  trabajos: "Gestión de trabajos",
  ventas: "Registro de lápidas",
  tareas: "Planificación de tareas",
  asistencias: "Asistencia",
};

export default function MainLayout({
  actual,
  navegar,
  usuario,
  cerrarSesion,
  children,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [avisosAbiertos, setAvisosAbiertos] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [errorAvisos, setErrorAvisos] = useState("");
  const [cargandoAvisos, setCargandoAvisos] = useState(false);

  async function cargarAvisos() {
    setCargandoAvisos(true);

    try {
      const respuesta = await obtenerTareas();
      setTareas(respuesta.tareas || []);
      setErrorAvisos("");
    } catch (error) {
      setErrorAvisos(
        error.message || "No se pudieron consultar las tareas."
      );
    } finally {
      setCargandoAvisos(false);
    }
  }

  useEffect(() => {
    cargarAvisos();
  }, [actual]);

  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);

  const avisos = tareas
    .filter((tarea) => tarea.estado !== "finalizada")
    .map((tarea) => ({
      ...tarea,
      dias: Math.round(
        (
          new Date(
            String(tarea.fechaLimite).slice(0, 10) + "T12:00:00"
          ) - hoy
        ) / 86400000
      ),
    }))
    .filter((tarea) => tarea.dias <= 2)
    .sort((a, b) => a.dias - b.dias);

  const vencidas = avisos.filter((tarea) => tarea.dias < 0).length;

  const irATareas = () => {
    setAvisosAbiertos(false);
    navegar("tareas");
  };

  return (
    <div className="min-h-screen md:flex app-background">
      <Sidebar
        actual={actual}
        navegar={navegar}
        abierto={menuAbierto}
        cerrar={() => setMenuAbierto(false)}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-10">
            <button
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>

            {/* Sección actual */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden font-semibold text-slate-400 sm:inline">
                  Administración
                </span>

                <ChevronRight
                  size={14}
                  className="hidden text-slate-300 sm:inline"
                />

                <span className="truncate font-extrabold text-[#203d6b]">
                  {nombres[actual] || "La Providencia"}
                </span>
              </div>

              <p className="hidden text-[11px] text-slate-500 sm:block">
                La Providencia · Control de operaciones
              </p>
            </div>

            {/* Acciones del encabezado */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {vencidas > 0 && (
                <button
                  onClick={irATareas}
                  className="hidden rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 lg:block"
                >
                  {vencidas}{" "}
                  {vencidas === 1
                    ? "tarea vencida"
                    : "tareas vencidas"}
                </button>
              )}

              {/* Notificaciones */}
              <div className="relative">
                <button
                  onClick={() => setAvisosAbiertos(!avisosAbiertos)}
                  aria-label="Ver avisos de tareas"
                  aria-expanded={avisosAbiertos}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#124B91] transition hover:bg-blue-50"
                >
                  <Bell size={19} />

                  {avisos.length > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {avisos.length > 9 ? "9+" : avisos.length}
                    </span>
                  )}
                </button>

                {avisosAbiertos && (
                  <>
                    <button
                      className="fixed inset-0 z-30 cursor-default"
                      aria-label="Cerrar avisos"
                      onClick={() => setAvisosAbiertos(false)}
                    />

                    <div className="absolute right-0 top-12 z-40 w-[min(88vw,370px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      <div className="border-b border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-black text-[#203d6b]">
                              Atención del equipo
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                              {vencidas} vencidas ·{" "}
                              {avisos.length - vencidas} próximas
                            </p>
                          </div>

                          <button
                            onClick={cargarAvisos}
                            disabled={cargandoAvisos}
                            aria-label="Actualizar avisos"
                            className="rounded-lg border border-slate-200 bg-white p-2 text-[#124B91] disabled:opacity-50"
                          >
                            <RefreshCw
                              size={16}
                              className={
                                cargandoAvisos ? "animate-spin" : ""
                              }
                            />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {errorAvisos ? (
                          <p
                            role="alert"
                            className="p-4 text-xs text-rose-700"
                          >
                            {errorAvisos}
                          </p>
                        ) : avisos.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-sm font-semibold text-slate-700">
                              Todo al día
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Sin tareas vencidas ni entregas en los
                              próximos dos días.
                            </p>
                          </div>
                        ) : (
                          avisos.slice(0, 10).map((tarea) => (
                            <button
                              key={tarea._id}
                              onClick={irATareas}
                              className="w-full border-b border-slate-100 p-3 text-left transition hover:bg-blue-50"
                            >
                              <p className="truncate text-sm font-bold text-[#203d6b]">
                                {tarea.titulo}
                              </p>

                              <p className="text-xs text-slate-500">
                                {tarea.trabajador?.nombre ||
                                  "Sin responsable"}
                              </p>

                              <p
                                className={`mt-1 text-xs font-bold ${
                                  tarea.dias < 0
                                    ? "text-rose-600"
                                    : "text-amber-700"
                                }`}
                              >
                                {tarea.dias < 0
                                  ? `Venció hace ${Math.abs(tarea.dias)} días`
                                  : tarea.dias === 0
                                    ? "Vence hoy"
                                    : tarea.dias === 1
                                      ? "Vence mañana"
                                      : "Vence en 2 días"}
                              </p>
                            </button>
                          ))
                        )}
                      </div>

                      <button
                        onClick={irATareas}
                        className="w-full bg-blue-50 p-3 text-xs font-extrabold text-[#124B91] transition hover:bg-blue-100"
                      >
                        Abrir planificación de tareas →
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Perfil real del usuario */}
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#123e83] to-[#934467] text-white">
                  <ShieldCheck size={17} />
                </span>

                <div className="hidden max-w-[180px] md:block">
                  <p className="truncate text-xs font-black text-[#203d6b]">
                    {usuario?.usuario || usuario?.email || "Usuario"}
                  </p>

                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {["admin", "superadmin"].includes(usuario?.rol)
                      ? "Administrador"
                      : "Usuario"}
                  </p>
                </div>
              </div>

              {/* Cerrar sesión */}
              <button
                onClick={cerrarSesion}
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut size={17} />
                <span className="hidden lg:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
