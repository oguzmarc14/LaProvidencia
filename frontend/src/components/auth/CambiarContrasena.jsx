import { avisar } from "../../services/avisos";
import { useId, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import BrandMark from "../BrandMark";

function CampoContrasena({ etiqueta, candado = false, ...input }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const Icono = visible ? EyeOff : Eye;

  return (
    <div>
      <label className="app-label" htmlFor={id}>{etiqueta}</label>
      <div className="relative">
        {candado && <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />}
        <input {...input} id={id} className="app-field" style={{ paddingRight: "3.25rem", ...(candado && { paddingLeft: "2.875rem" }) }}
          type={visible ? "text" : "password"} required />
        <button type="button" aria-label={`${visible ? "Ocultar" : "Mostrar"} ${etiqueta.toLowerCase()}`}
          aria-controls={id} onClick={() => setVisible(actual => !actual)}
          className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
          <Icono size={19} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function CambiarContrasena({ alCambiar, temporal = true, minimo = 12, alCancelar }) {
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
      avisar("error", "Revisa la confirmación", "Las contraseñas nuevas no coinciden.");
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
            <h1 className="text-2xl font-bold text-slate-800">{temporal ? "Crea tu contraseña" : "Cambia tu contraseña"}</h1>
            <p className="mt-2 text-sm text-slate-500">{temporal ? "La clave temporal ya no podrá usarse después de este paso." : "Confirma tu contraseña actual para elegir otra."}</p>
          </div>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          <CampoContrasena etiqueta="Contraseña actual" candado autoComplete="current-password"
            value={contrasenaActual} onChange={evento => setContrasenaActual(evento.target.value)}
            placeholder={temporal ? "Contraseña temporal" : "Contraseña actual"} />
          <CampoContrasena etiqueta="Nueva contraseña" autoComplete="new-password" minLength={minimo} maxLength={128}
            value={contrasenaNueva} onChange={evento => setContrasenaNueva(evento.target.value)} placeholder={`Mínimo ${minimo} caracteres`} />
          <CampoContrasena etiqueta="Confirma la nueva contraseña" autoComplete="new-password" minLength={minimo} maxLength={128}
            value={confirmacion} onChange={evento => setConfirmacion(evento.target.value)} placeholder="Repite tu nueva contraseña" />
          <button className="app-primary w-full rounded-xl px-5 py-3 font-semibold disabled:opacity-60" disabled={cargando} type="submit">
            {cargando ? "Actualizando..." : "Guardar contraseña"}
          </button>
          <button type="button" disabled={cargando} onClick={alCancelar} className="w-full rounded-xl py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            {temporal ? "Cerrar sesión" : "Cancelar"}
          </button>
        </form>
      </section>
    </main>
  );
}
