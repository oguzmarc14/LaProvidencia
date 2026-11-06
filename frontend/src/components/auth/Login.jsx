import { useState } from "react";
import { LockKeyhole, Mail, LoaderCircle } from "lucide-react";

export default function Login({ onLogin }) {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try { await onLogin(identificador.trim(), password); }
    catch (err) { setError(err.message || "No se pudo iniciar sesión."); }
    finally { setCargando(false); }
  }
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#edf3fa] via-[#f6f3f8] to-[#f8edf1] p-4">
    <form onSubmit={enviar} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#123e83] to-[#934467] text-white"><LockKeyhole size={30}/></div>
        <h1 className="font-serif text-2xl font-bold tracking-wide text-[#203d6b]">LA PROVIDENCIA</h1>
        <p className="mt-2 text-sm text-slate-500">Acceso al sistema de organización</p>
      </div>
      <label htmlFor="identificador" className="mb-2 block text-sm font-bold text-slate-700">Usuario o correo electrónico</label>
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-[#124B91]">
        <Mail size={18} className="text-slate-400"/>
        <input id="identificador" autoComplete="username" autoFocus required value={identificador} onChange={e=>setIdentificador(e.target.value)} className="w-full py-3 outline-none" placeholder="Usuario o correo"/>
      </div>
      <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">Contraseña</label>
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-[#124B91]">
        <LockKeyhole size={18} className="text-slate-400"/>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full py-3 outline-none" placeholder="Ingresa tu contraseña"/>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <button disabled={cargando} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#124B91] px-5 py-3 font-bold text-white hover:bg-[#0e3974] disabled:opacity-60">{cargando && <LoaderCircle className="animate-spin" size={18}/>} Iniciar sesión</button>
      <p className="mt-6 text-center text-xs text-slate-400">Acceso exclusivo para personal autorizado</p>
    </form>
  </div>;
}
