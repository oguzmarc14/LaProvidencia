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
    <section className="mx-auto max-w-7xl p-4 pb-12 sm:p-6 lg:p-10">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white shadow-[0_18px_40px_rgba(43,46,101,.2)] sm:p-9"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/75">LA PROVIDENCIA · ADMINISTRACIÓN</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Equipo de trabajo</h1><p className="mt-3 max-w-xl text-base text-white/85">Administra al equipo y consulta sus asignaciones.</p></div><button onClick={() => {setEditando(null);setModalAbierto(true);}} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-[#123e83] shadow-sm hover:bg-blue-50"><Plus size={19}/> Nuevo trabajador</button></div>
      <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-[#cbd4e6] bg-white px-5 py-4 shadow-sm">
        <Search size={20} className="text-slate-400"/><input aria-label="Buscar trabajadores" placeholder="Buscar trabajador por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full outline-none"/>
      </div>
      {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
      {cargando ? <p className="py-12 text-center text-slate-500">Cargando trabajadores...</p> : filtrados.length === 0 ?
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">No hay trabajadores para mostrar.</div> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((t) => <article key={t._id} className="group overflow-hidden rounded-[24px] border border-[#cbd4e6] bg-white shadow-[0_12px_32px_rgba(25,45,90,.12)] transition duration-200 hover:-translate-y-1 hover:border-[#9f8abf] hover:shadow-xl">
            <div className="h-1.5 bg-gradient-to-r from-[#124B91] via-[#64417c] to-[#a33d63]"/><div className="p-6"><div className="mb-4 flex items-start justify-between"><div className="rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 p-3 text-[#124B91]"><Users size={24}/></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{t.activo ? "Activo" : "Inactivo"}</span></div>
            <h3 className="text-xl font-extrabold text-slate-900">{t.nombre}</h3><p className="mt-4 rounded-xl border border-[#e2e7f1] bg-gradient-to-br from-[#f2f6fc] to-[#faf3f8] p-4 text-sm font-medium text-slate-700">{t.whatsapp || "Sin WhatsApp registrado"}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button onClick={() => { setEditando(t); setModalAbierto(true); }} className="flex items-center gap-2 rounded-xl border-2 border-[#b9c9e3] bg-blue-50 px-3 py-2 text-sm font-bold text-[#124B91] hover:bg-blue-100"><Pencil size={15}/> Editar</button>
              <button onClick={() => setViendoTrabajos(t)} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"><BriefcaseBusiness size={15}/> Ver trabajos</button>
            </div>
            </div></article>)}
        </div>}
      {modalAbierto && <ModalTrabajador trabajador={editando} onClose={() => setModalAbierto(false)} onSave={guardar} saving={guardando}/>}
      {viendoTrabajos && <ModalTrabajos trabajador={viendoTrabajos} onClose={() => setViendoTrabajos(null)}/>}
    </section>
  );
}
