import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import BrandMark from "../BrandMark";

export default function CambiarContrasena({ alCambiar }) {
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    if (contrasenaNueva !== confirmacion) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setCargando(true);
    try {
      await alCambiar(contrasenaActual, contrasenaNueva);
    } catch (errorCambio) {
      setError(errorCambio.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="app-background flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-2xl shadow-slate-900/15">
        <div className="bg-gradient-to-br from-[#f5444b] via-[#a33d63] to-[#554372] px-8 py-8">
          <BrandMark/>
        </div>
        <form className="space-y-5 p-8 sm:p-10" onSubmit={enviar}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Crea tu contraseña</h1>
            <p className="mt-2 text-sm text-slate-500">La clave temporal ya no podrá usarse después de este paso.</p>
          </div>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          <label className="block">
            <span className="app-label">Contraseña actual</span>
            <span className="relative block">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true"/>
              <input className="app-field pl-10" type="password" autoComplete="current-password" required value={contrasenaActual} onChange={(evento) => setContrasenaActual(evento.target.value)} placeholder="Contraseña temporal"/>
            </span>
          </label>
          <label className="block">
            <span className="app-label">Nueva contraseña</span>
            <input className="app-field" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={contrasenaNueva} onChange={(evento) => setContrasenaNueva(evento.target.value)} placeholder="Mínimo 12 caracteres"/>
          </label>
          <label className="block">
            <span className="app-label">Confirma la nueva contraseña</span>
            <input className="app-field" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmacion} onChange={(evento) => setConfirmacion(evento.target.value)} placeholder="Repite tu nueva contraseña"/>
          </label>
          <button className="app-primary w-full rounded-xl px-5 py-3 font-semibold disabled:opacity-60" disabled={cargando} type="submit">
            {cargando ? "Actualizando..." : "Guardar contraseña"}
          </button>
        </form>
      </section>
    </main>
  );
}
