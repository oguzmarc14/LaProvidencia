import { useEffect, useRef, useState } from "react";
import { cambiarContrasenaUsuario, crearUsuario, obtenerUsuarios } from "../../../services/authService";

export default function ModalAccesoTrabajador({ trabajador, alCerrar }) {
  const dialogo = useRef(null);
  const [cuenta, setCuenta] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dialogo.current.open) dialogo.current.showModal();
    let activo = true;
    obtenerUsuarios().then((usuarios) => {
      if (!activo) return;
      setCuenta(usuarios.find((usuario) => usuario.trabajador === trabajador._id) || null);
      setCargando(false);
    }).catch((e) => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, [trabajador._id]);

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const acceso = cuenta
        ? await cambiarContrasenaUsuario(cuenta.id, password)
        : await crearUsuario(email, password, trabajador._id);
      setMensaje(cuenta ? "Contraseña temporal actualizada." : "Acceso habilitado.");
      setCuenta(acceso);
      setPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <dialog ref={dialogo} onCancel={(evento) => {
      evento.preventDefault();
      if (!guardando) alCerrar();
    }} aria-labelledby="titulo-acceso" className="m-auto w-[min(92vw,30rem)] rounded-2xl p-6 shadow-xl backdrop:bg-slate-900/60">
      <h2 id="titulo-acceso" className="text-xl font-bold text-slate-900">Acceso de {trabajador.nombre}</h2>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
      {mensaje && <p role="status" className="mt-3 text-sm text-emerald-700">{mensaje} El trabajador deberá cambiarla al iniciar sesión.</p>}
      {cargando ? <p className="mt-3 text-sm text-slate-600">{error ? "Cierra y vuelve a abrir para reintentar." : "Consultando acceso..."}</p> : (
        <form onSubmit={guardar} className="mt-4 space-y-4">
          {cuenta ? <p className="text-sm text-slate-600">{cuenta.email} · {cuenta.debeCambiarContrasena ? "Cambio pendiente" : "Acceso activo"}</p> : (
            <label className="block">
              <span className="app-label">Correo de acceso</span>
              <input className="app-field" type="email" required maxLength={254} autoComplete="off"
                value={email} onChange={(evento) => setEmail(evento.target.value)}/>
            </label>
          )}
          <label className="block">
            <span className="app-label">Contraseña temporal</span>
            <input className="app-field" type="password" required minLength={8} maxLength={128}
              autoComplete="new-password" value={password} onChange={(evento) => setPassword(evento.target.value)}/>
          </label>
          <button className="accion-ancho-movil app-primary rounded-xl px-4 py-3 font-bold disabled:opacity-60" disabled={guardando}>
            {guardando ? "Guardando..." : cuenta ? "Restablecer contraseña" : "Crear acceso"}
          </button>
        </form>
      )}
      <button type="button" disabled={guardando} onClick={alCerrar} className="mt-4 rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">Cerrar</button>
    </dialog>
  );
}
