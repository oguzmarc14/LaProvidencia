import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Search, Users } from "lucide-react";
import { actualizarTrabajador, crearTrabajador, obtenerTrabajadores } from "../services/trabajadoresService";
import ModalTrabajador from "../components/ModalTrabajador";
import ModalTrabajos from "../components/ModalTrabajos";

export default function SeccionTrabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [viendoTrabajos, setViendoTrabajos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerTrabajadores();
      setTrabajadores(datos.trabajadores || []);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (datos) => {
    setGuardando(true);
    setError("");
    try {
      if (editando) await actualizarTrabajador(editando._id, datos);
      else await crearTrabajador({ nombre: datos.nombre, whatsapp: datos.whatsapp });
      setModalAbierto(false);
      setEditando(null);
      await cargar();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const filtrados = trabajadores.filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  return (
    <section className="mx-auto max-w-6xl p-5 md:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm font-semibold text-[#124B91]">GESTIÓN DE PERSONAL</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Trabajadores</h1><p className="mt-2 text-slate-500">Registra empleados y consulta sus trabajos asignados.</p></div>
        <button onClick={() => { setEditando(null); setModalAbierto(true); }} className="flex items-center gap-2 rounded-xl bg-[#124B91] px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-800"><Plus size={18}/> Nuevo trabajador</button>
      </div>
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <Search size={20} className="text-slate-400"/><input aria-label="Buscar trabajadores" placeholder="Buscar trabajador por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full outline-none"/>
      </div>
      {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
      {cargando ? <p className="py-12 text-center text-slate-500">Cargando trabajadores...</p> : filtrados.length === 0 ?
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">No hay trabajadores para mostrar.</div> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((t) => <article key={t._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between"><div className="rounded-xl bg-blue-50 p-3 text-[#124B91]"><Users size={24}/></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{t.activo ? "Activo" : "Inactivo"}</span></div>
            <h3 className="text-lg font-bold">{t.nombre}</h3><p className="mt-1 text-sm text-slate-500">{t.whatsapp || "Sin WhatsApp registrado"}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
              <button onClick={() => { setEditando(t); setModalAbierto(true); }} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"><Pencil size={15}/> Editar</button>
              <button onClick={() => setViendoTrabajos(t)} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"><BriefcaseBusiness size={15}/> Ver trabajos</button>
            </div>
          </article>)}
        </div>}
      {modalAbierto && <ModalTrabajador trabajador={editando} onClose={() => setModalAbierto(false)} onSave={guardar} saving={guardando}/>}
      {viendoTrabajos && <ModalTrabajos trabajador={viendoTrabajos} onClose={() => setViendoTrabajos(null)}/>}
    </section>
  );
}
