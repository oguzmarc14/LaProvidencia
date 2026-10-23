import { useEffect, useState } from "react";
import { KeyRound, LoaderCircle, Plus, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import {
  cambiarContrasenaUsuario,
  crearUsuario,
  obtenerUsuarios,
} from "../../../services/authService";

export default function SeccionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  async function cargarUsuarios() {
    setError("");
    try {
      setUsuarios(await obtenerUsuarios());
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function crearCuenta(evento) {
    evento.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);
    try {
      const usuario = await crearUsuario(email, password);
      setMensaje(`La cuenta ${usuario.email} quedó creada. Deberá cambiar su contraseña al iniciar sesión.`);
      setEmail("");
      setPassword("");
      await cargarUsuarios();
    } catch (errorCrear) {
      setError(errorCrear.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarContrasena(evento, id) {
    evento.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);
    try {
      const usuario = await cambiarContrasenaUsuario(id, nuevaContrasena);
      setMensaje(`Contraseña actualizada para ${usuario.email}. Deberá cambiarla al iniciar sesión.`);
      setUsuarioEditando("");
      setNuevaContrasena("");
      await cargarUsuarios();
    } catch (errorCambio) {
      setError(errorCambio.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a33d63]">Administración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Usuarios del sistema</h1>
        <p className="mt-2 text-sm text-slate-500">Crea cuentas y administra sus contraseñas. Los cambios de contraseña requieren un nuevo cambio al iniciar sesión.</p>
      </div>

      {mensaje && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{mensaje}</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <form className="bg-white rounded-2xl shadow-sm border-b-4 border-[#124B91] flex min-h-64 flex-col p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md" onSubmit={crearCuenta}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f4f9] rounded-bl-[80px] z-0 pointer-events-none"></div>
          <h2 className="flex items-center gap-2 font-semibold text-slate-800 relative z-10"><UserPlus size={19} className="text-[#554372]"/> Crear usuario</h2>
          <label className="mt-5 block relative z-10">
            <span className="app-label">Correo electrónico</span>
            <input className="app-field" type="email" autoComplete="off" required maxLength={254} value={email} onChange={(evento) => setEmail(evento.target.value)} placeholder="persona@empresa.com"/>
          </label>
          <label className="mt-4 block relative z-10">
            <span className="app-label">Contraseña inicial</span>
            <input className="app-field" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={(evento) => setPassword(evento.target.value)} placeholder="Mínimo 12 caracteres"/>
          </label>
          <button className="app-primary mt-5 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 font-semibold disabled:opacity-60 relative z-10" disabled={guardando} type="submit">
            {guardando ? <LoaderCircle className="animate-spin" size={18}/> : <Plus size={18}/>}
            {guardando ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        {cargando && (
          <div className="bg-white rounded-2xl shadow-sm border-b-4 border-[#124B91] flex min-h-64 items-center justify-center gap-3 p-6 text-sm text-slate-500 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f4f9] rounded-bl-[80px] z-0 pointer-events-none"></div>
            <LoaderCircle className="animate-spin text-[#554372] relative z-10" size={20}/> <span className="relative z-10">Cargando usuarios...</span>
          </div>
        )}

        {!cargando && usuarios.map((usuario) => (
          <article key={usuario.id} className="bg-white rounded-2xl shadow-sm border-b-4 border-[#124B91] flex min-h-64 flex-col p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f4f9] rounded-bl-[80px] z-0 pointer-events-none"></div>
            
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80 text-[#124B91]">
                <UsersRound size={23}/>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${usuario.debeCambiarContrasena ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                {usuario.debeCambiarContrasena ? "Cambio pendiente" : "Activo"}
              </span>
            </div>
            
            <h2 className="mt-5 break-all text-lg font-bold text-slate-800 relative z-10">{usuario.email}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 relative z-10"><ShieldCheck size={15}/> Usuario del sistema</p>

            {usuarioEditando === usuario.id ? (
              <form className="mt-5 space-y-3 border-t border-slate-100 pt-4 relative z-10" onSubmit={(evento) => guardarContrasena(evento, usuario.id)}>
                <label className="block">
                  <span className="app-label">Nueva contraseña temporal</span>
                  <input className="app-field" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={nuevaContrasena} onChange={(evento) => setNuevaContrasena(evento.target.value)} placeholder="Mínimo 12 caracteres"/>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className="app-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60" disabled={guardando} type="submit">
                    {guardando ? "Guardando..." : "Guardar contraseña"}
                  </button>
                  <button className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100" type="button" onClick={() => {setUsuarioEditando(""); setNuevaContrasena("");}}>Cancelar</button>
                </div>
              </form>
            ) : (
              <button className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl border border-[#dce3f0] px-4 py-2.5 text-sm font-semibold text-[#124B91] transition hover:bg-blue-50 relative z-10" type="button" onClick={() => {setUsuarioEditando(usuario.id); setNuevaContrasena(""); setMensaje(""); setError("");}}>
                <KeyRound size={16}/> Cambiar contraseña
              </button>
            )}
          </article>
        ))}

        {!cargando && usuarios.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-b-4 border-[#124B91] flex min-h-64 flex-col items-center justify-center p-6 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f4f9] rounded-bl-[80px] z-0 pointer-events-none"></div>
            <UsersRound className="text-slate-300 relative z-10" size={30}/>
            <p className="mt-3 font-semibold text-slate-700 relative z-10">Aún no hay usuarios</p>
            <p className="mt-1 text-sm text-slate-500 relative z-10">Crea una cuenta con el formulario para comenzar.</p>
          </div>
        )}
      </div>
    </section>
  );
}