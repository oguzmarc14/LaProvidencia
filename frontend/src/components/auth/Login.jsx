import { useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import BrandMark from "../BrandMark";

export default function Login({ alIniciarSesion, errorSesion }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setCargando(true);
    try {
      await alIniciarSesion(email, password);
    } catch (errorInicio) {
      setError(errorInicio.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10">
      
      {/* Efecto de difusión de colores en el fondo */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full bg-[#f5444b] opacity-10 blur-[120px]"></div>
      <div className="pointer-events-none absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[#a33d63] opacity-[0.08] blur-[120px]"></div>
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-[#1c3f77] opacity-10 blur-[120px]"></div>

      <section className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-900/15">
        
        {/* Cabecera con degradado y logo */}
        <div className="flex justify-center bg-gradient-to-br from-[#f5444b] via-[#a33d63] to-[#554372] px-8 py-10">
          <BrandMark />
        </div>
        
        <form className="p-8 sm:p-10" onSubmit={enviar}>
          
          {/* Títulos */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-slate-800">Bienvenido</h1>
            <p className="mt-1.5 text-xs text-slate-500">Inicia sesión para continuar</p>
          </div>

          {errorSesion && <p role="alert" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{errorSesion}</p>}
          {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          {/* Campos de formulario */}
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-700">Correo electrónico</span>
              <span className="relative block">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true"/>
                <input 
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#554372] focus:ring-1 focus:ring-[#554372]" 
                  type="email" autoComplete="username" required maxLength={254} value={email} onChange={(evento) => setEmail(evento.target.value)} placeholder="nombre@empresa.com"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-700">Contraseña</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true"/>
                <input 
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#554372] focus:ring-1 focus:ring-[#554372]" 
                  type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={(evento) => setPassword(evento.target.value)} placeholder="Tu contraseña"
                />
              </span>
            </label>
          </div>

          {/* Botón */}
          <button className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#1c3f77] to-[#463a62] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 disabled:opacity-60" disabled={cargando} type="submit">
            {cargando ? "Validando..." : "Iniciar sesión"}
          </button>

          <p className="mt-5 text-center text-[10px] text-slate-400">Acceso exclusivo para personal autorizado</p>
        </form>
      </section>
    </main>
  );
}