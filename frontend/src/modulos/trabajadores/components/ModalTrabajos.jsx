import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { obtenerTrabajosDeTrabajador } from "../services/trabajadoresService";

export default function ModalTrabajos({ trabajador, onClose }) {
  const [trabajos, setTrabajos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    obtenerTrabajosDeTrabajador(trabajador._id)
      .then((datos) => { if (vigente) setTrabajos(datos.trabajos || []); })
      .catch((e) => { if (vigente) setError(e.message); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [trabajador._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="text-xl font-bold">Trabajos asignados</h2><p className="text-sm text-slate-500">{trabajador.nombre}</p></div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button>
        </div>
        {cargando ? <p>Cargando trabajos...</p> : error ? <p role="alert" className="text-red-600">{error}</p> : trabajos.length === 0 ? <p className="text-slate-500">No tiene trabajos asignados.</p> :
          <div className="space-y-3">{trabajos.map((trabajo) =>
            <article key={trabajo._id} className="rounded-xl border p-3">
              <p className="font-semibold">{trabajo.nombre}</p>
              <p className="text-sm text-slate-500">Material: {trabajo.material} · Estado: {trabajo.estado}</p>
            </article>)}</div>}
      </section>
    </div>
  );
}
