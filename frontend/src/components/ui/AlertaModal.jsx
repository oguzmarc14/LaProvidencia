import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, CircleHelp, X, XCircle, Info } from "lucide-react";

const estilos = {
  confirm: { icono: CircleHelp, fondo: "bg-blue-100 text-[#124B91]", boton: "bg-[#124B91] hover:bg-[#0c3871]" },
  danger: { icono: AlertTriangle, fondo: "bg-rose-100 text-rose-700", boton: "bg-rose-600 hover:bg-rose-700" },
  success: { icono: CheckCircle2, fondo: "bg-emerald-100 text-emerald-700", boton: "bg-emerald-600 hover:bg-emerald-700" },
  error: { icono: XCircle, fondo: "bg-rose-100 text-rose-700", boton: "bg-rose-600 hover:bg-rose-700" },
  info: { icono: Info, fondo: "bg-blue-100 text-[#124B91]", boton: "bg-[#124B91] hover:bg-[#0c3871]" }
};

export default function AlertaModal({ alerta, onConfirmar, onCerrar, procesando = false }) {
  useEffect(() => {
    if (!alerta) return;
    const tecla = e => { if (e.key === "Escape" && !procesando) onCerrar(); };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [alerta, procesando, onCerrar]);
  if (!alerta) return null;
  const estilo = estilos[alerta.tipo] || estilos.info;
  const Icono = estilo.icono;
  const confirmar = typeof onConfirmar === "function" && (alerta.tipo === "confirm" || alerta.tipo === "danger");
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b1631]/70 p-4 backdrop-blur-[4px]" onMouseDown={e => { if (e.target === e.currentTarget && !procesando) onCerrar(); }}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="titulo-alerta" aria-describedby="mensaje-alerta" className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-[0_30px_90px_rgba(6,17,43,.4)]">
      <div className="h-1.5 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65]"/>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <span className={`grid h-14 w-14 place-items-center rounded-2xl ${estilo.fondo}`}><Icono size={28}/></span>
          <button type="button" disabled={procesando} onClick={onCerrar} aria-label="Cerrar aviso" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={20}/></button>
        </div>
        <h2 id="titulo-alerta" className="mt-5 text-xl font-extrabold text-slate-900">{alerta.titulo}</h2>
        <p id="mensaje-alerta" className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">{alerta.mensaje}</p>
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          {confirmar && <button type="button" disabled={procesando} onClick={onCerrar} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>}
          <button type="button" autoFocus disabled={procesando} onClick={confirmar ? onConfirmar : onCerrar} className={`rounded-xl px-6 py-3 text-sm font-extrabold text-white shadow-sm transition disabled:opacity-60 ${estilo.boton}`}>{procesando ? "Procesando..." : confirmar ? (alerta.confirmarTexto || "Aceptar") : "OK"}</button>
        </div>
      </div>
    </section>
  </div>;
}
