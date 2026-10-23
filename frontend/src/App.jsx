import { useEffect, useState } from "react";
import { cambiarContrasena, cerrarSesion, iniciarSesion, obtenerSesion } from "./services/authService";
import { obtenerToken } from "./services/api";
import CambiarContrasena from "./components/auth/CambiarContrasena";
import Login from "./components/auth/Login";
import MainLayout from "./components/layout/MainLayout";
import SeccionDashboard from "./modulos/dashboard/pages/SeccionDashboard";
import SeccionTrabajadores from "./modulos/trabajadores/pages/SeccionTrabajadores";
import SeccionClientes from "./modulos/clientes/pages/SeccionClientes";
import SeccionTrabajos from "./modulos/trabajos/pages/SeccionTrabajos";
import SeccionUsuarios from "./modulos/usuarios/pages/SeccionUsuarios";

export default function App() {
  const [seccion, setSeccion] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorSesion, setErrorSesion] = useState("");
  const [errorInicio, setErrorInicio] = useState("");

  useEffect(() => {
    let activo = true;
    const restaurarSesion = async () => {
      if (!obtenerToken()) {
        if (activo) setCargando(false);
        return;
      }
      try {
        const sesion = await obtenerSesion();
        if (activo) {
          setUsuario(sesion);
          setErrorSesion("");
        }
      } catch (error) {
        if (activo && obtenerToken()) setErrorSesion("No se pudo verificar tu sesión. Revisa la conexión con el servidor.");
      } finally {
        if (activo) setCargando(false);
      }
    };
    const expirarSesion = () => {
      setUsuario(null);
      setSeccion("dashboard");
      setErrorInicio("Tu sesión venció. Inicia sesión nuevamente.");
    };
    window.addEventListener("auth:expired", expirarSesion);
    restaurarSesion();
    return () => {
      activo = false;
      window.removeEventListener("auth:expired", expirarSesion);
    };
  }, []);

  async function entrar(email, password) {
    const sesion = await iniciarSesion(email, password);
    setUsuario(sesion);
    setErrorInicio("");
  }

  async function salir() {
    await cerrarSesion();
    setUsuario(null);
    setSeccion("dashboard");
    setErrorInicio("");
  }

  async function actualizarContrasena(contrasenaActual, contrasenaNueva) {
    const sesion = await cambiarContrasena(contrasenaActual, contrasenaNueva);
    setUsuario(sesion);
  }

  if (cargando) {
    return <main className="app-background flex min-h-screen items-center justify-center text-sm font-medium text-slate-600">Verificando sesión...</main>;
  }
  if (!usuario) {
    if (errorSesion && obtenerToken()) {
      return (
        <main className="app-background flex min-h-screen items-center justify-center px-5">
          <section className="app-panel max-w-md space-y-4 p-7 text-center">
            <p role="alert" className="text-sm text-rose-700">{errorSesion}</p>
            <button className="app-primary rounded-xl px-5 py-3 font-semibold" onClick={() => window.location.reload()}>Reintentar</button>
            <button className="ml-2 rounded-xl px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100" onClick={salir}>Cerrar sesión</button>
          </section>
        </main>
      );
    }
    return <Login alIniciarSesion={entrar} errorSesion={errorInicio}/>;
  }
  if (usuario.debeCambiarContrasena) {
    return <CambiarContrasena alCambiar={actualizarContrasena}/>;
  }

  const contenido = seccion === "dashboard" ? <SeccionDashboard navegar={setSeccion}/> :
    seccion === "clientes" ? <SeccionClientes/> :
    seccion === "trabajos" ? <SeccionTrabajos/> :
    seccion === "usuarios" && usuario.rol === "superadmin" ? <SeccionUsuarios/> :
    <SeccionTrabajadores/>;

  return <MainLayout actual={seccion} navegar={setSeccion} usuario={usuario} cerrarSesion={salir}>{contenido}</MainLayout>;
}
