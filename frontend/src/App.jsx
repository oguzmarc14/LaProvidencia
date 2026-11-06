import { useEffect, useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import Login from "./components/auth/Login";
import { iniciarSesion, consultarSesion, cerrarSesion } from "./services/authService";
import { obtenerToken } from "./services/api";
import SeccionDashboard from "./modulos/dashboard/pages/SeccionDashboard";
import SeccionTrabajadores from "./modulos/trabajadores/pages/SeccionTrabajadores";
import SeccionClientes from "./modulos/clientes/pages/SeccionClientes";
import SeccionTrabajos from "./modulos/trabajos/pages/SeccionTrabajos";
import SeccionVentas from "./modulos/ventas/pages/SeccionVentas";
import SeccionTareas from "./modulos/tareas/pages/SeccionTareas";

export default function App() {
  const [seccion, setSeccion] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  useEffect(() => {
    let activo = true;
    const expirada = () => { if (activo) { setUsuario(null); setSeccion("dashboard"); } };
    window.addEventListener("auth:expired", expirada);
    (async () => {
      if (!obtenerToken()) { if (activo) setCargandoSesion(false); return; }
      try { const actual = await consultarSesion(); if (activo) setUsuario(actual); }
      catch { cerrarSesion(); }
      finally { if (activo) setCargandoSesion(false); }
    })();
    return () => { activo = false; window.removeEventListener("auth:expired", expirada); };
  }, []);
  const salir = () => { cerrarSesion(); setUsuario(null); setSeccion("dashboard"); };
  if (cargandoSesion) return <div className="flex min-h-screen items-center justify-center text-slate-600">Verificando sesión...</div>;
  if (!usuario) return <Login onLogin={async (identificador, password) => {
    const cuenta = await iniciarSesion(identificador, password);
    setUsuario(cuenta);
    setSeccion("dashboard");
  }}/>;
  return <MainLayout actual={seccion} navegar={setSeccion} usuario={usuario} onLogout={salir}>
    {seccion === "dashboard" ? <SeccionDashboard navegar={setSeccion}/> :
      seccion === "clientes" ? <SeccionClientes/> :
      seccion === "trabajos" ? <SeccionTrabajos/> :
      seccion === "ventas" ? <SeccionVentas/> :
      seccion === "tareas" ? <SeccionTareas/> : <SeccionTrabajadores/>}
  </MainLayout>;
}
