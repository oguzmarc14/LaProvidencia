import { useState } from "react";

export default function Configuracion({ nombre, guardar }) {
  const [valor, setValor] = useState(nombre);
  return <section className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
    <header className="rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white">
      <h1 className="text-3xl font-black">Configuración</h1>
    </header>
    <form className="app-panel space-y-4 p-5" onSubmit={evento => { evento.preventDefault(); if (valor.trim()) guardar(valor.trim()); }}>
      <label className="block font-semibold">Nombre para mostrar
        <input className="app-field mt-2" autoComplete="given-name" required maxLength={60} value={valor} onChange={evento => setValor(evento.target.value)} />
      </label>
      <p className="text-sm text-slate-600">Se usa en el saludo y en tu perfil de este navegador.</p>
      <button type="submit" className="app-primary accion-ancho-movil rounded-xl px-5 py-3 font-bold">Guardar nombre</button>
    </form>
  </section>;
}
