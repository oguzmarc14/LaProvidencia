import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Search, Users, MessageCircle, ArrowUpRight, Phone } from "lucide-react";
import { actualizarTrabajador, crearTrabajador, obtenerTrabajadores } from "../services/trabajadoresService";
import ModalTrabajador from "../components/ModalTrabajador";
import ModalTrabajos from "../components/ModalTrabajos";
import AlertaModal from "../../../components/ui/AlertaModal";
import { enlaceWhatsApp } from "../../clientes/utils/enlacesCliente";

export default function SeccionTrabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [viendoTrabajos, setViendoTrabajos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

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

  const guardar = datos => {
    const esEdicion = !!editando;
    const id = editando?._id;
    setAlerta({ tipo:"confirm", titulo:esEdicion ? "¿Guardar cambios del trabajador?" : "¿Registrar trabajador?", mensaje:`Se ${esEdicion ? "actualizará" : "registrará"} a "${datos.nombre}".`, accion:async () => {
      setGuardando(true);
      try {
        if (esEdicion) await actualizarTrabajador(id, datos);
        else await crearTrabajador({ nombre:datos.nombre, whatsapp:datos.whatsapp });
        setModalAbierto(false); setEditando(null);
        await cargar();
        return { tipo:"success", titulo:esEdicion ? "Trabajador actualizado" : "Trabajador registrado", mensaje:"Los datos se guardaron correctamente." };
      } catch (e) { return { tipo:"error", titulo:"No se pudo guardar", mensaje:e.message }; }
      finally { setGuardando(false); }
    }});
  };
  const ejecutarConfirmacion = async () => {
    if (!alerta?.accion) return;
    setConfirmando(true);
    try { setAlerta(await alerta.accion() || null); }
    catch (e) { setAlerta({ tipo:"error", titulo:"Ocurrió un error", mensaje:e.message }); }
    finally { setConfirmando(false); }
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
          {filtrados.map((t) => {
            const whatsapp = enlaceWhatsApp(t.whatsapp);
            return <article key={t._id} className="brand-card group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">
              <div className="h-1.5 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65]"/>
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 text-[#124B91]"><Users size={24}/></span>
                  <div className="min-w-0 flex-1"><p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Miembro del equipo</p><button type="button" onClick={() => setViendoTrabajos(t)} className="mt-1 break-words text-left text-lg font-extrabold leading-snug text-slate-900 transition hover:text-[#124B91] hover:underline">{t.nombre} <ArrowUpRight size={15} className="inline align-baseline"/></button></div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${t.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{t.activo ? "● Activo" : "Inactivo"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                  <Phone size={17} className="shrink-0 text-[#124B91]"/>
                  <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-slate-500">Contacto</p><p className="break-all text-sm font-bold text-slate-800">{t.whatsapp || "Sin número registrado"}</p></div>
                  {whatsapp && <a href={whatsapp + "?text=" + encodeURIComponent(`Hola, ${t.nombre}. Te contactamos de La Providencia.`)} target="_blank" rel="noopener noreferrer" aria-label={`Enviar WhatsApp a ${t.nombre}`} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-700"><MessageCircle size={16}/> WhatsApp</a>}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setViendoTrabajos(t)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#124B91] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#0d3770]"><BriefcaseBusiness size={17}/> Ver seguimiento <ArrowUpRight size={15}/></button>
                  <button type="button" onClick={() => { setEditando(t); setModalAbierto(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-[#124B91] transition hover:bg-blue-50"><Pencil size={16}/> Editar</button>
                </div>
              </div>
            </article>;
          })}
        </div>}
      <AlertaModal alerta={alerta} procesando={confirmando} onCerrar={() => setAlerta(null)} onConfirmar={ejecutarConfirmacion}/>
      {modalAbierto && <ModalTrabajador trabajador={editando} onClose={() => setModalAbierto(false)} onSave={guardar} saving={guardando}/>}
      {viendoTrabajos && <ModalTrabajos trabajador={viendoTrabajos} onClose={() => setViendoTrabajos(null)}/>}
    </section>
  );
}
