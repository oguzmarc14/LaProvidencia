import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { obtenerClientes, crearCliente, actualizarCliente } from "../services/clientesService";
import CardCliente from "../components/CardCliente";
import ModalCliente from "../components/ModalCliente";
export default function SeccionClientes() {
  const [clientes,setClientes] = useState([]), [busqueda,setBusqueda] = useState(""), [modal,setModal] = useState(false), [editando,setEditando] = useState(null), [guardando,setGuardando] = useState(false), [cargando,setCargando] = useState(true), [error,setError] = useState("");
  async function cargar() { setCargando(true); try { const datos=await obtenerClientes(); setClientes(datos.clientes || []); setError(""); } catch(e) {setError(e.message);} finally {setCargando(false);} }
  useEffect(() => { cargar(); }, []);
  async function guardar(datos) { setGuardando(true); setError(""); try { if(editando) await actualizarCliente(editando._id,datos); else await crearCliente(datos); setModal(false); setEditando(null); await cargar(); } catch(e) {setError(e.message);} finally {setGuardando(false);} }
  const filtrados=clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  return <section className="mx-auto max-w-7xl p-4 pb-12 sm:p-6 lg:p-10">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white shadow-[0_18px_40px_rgba(43,46,101,.2)] sm:p-9"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/75">LA PROVIDENCIA · ADMINISTRACIÓN</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Directorio de clientes</h1><p className="mt-3 max-w-xl text-base text-white/85">Organiza tu directorio y mantén los datos de contacto al día.</p></div><button onClick={() => {setEditando(null);setModal(true);}} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-[#123e83] shadow-sm hover:bg-blue-50"><Plus size={19}/> Nuevo cliente</button></div>
    <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-[#cbd4e6] bg-white px-5 py-4 shadow-sm"><Search size={19} className="text-slate-400"/><input aria-label="Buscar clientes" placeholder="Buscar cliente por nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full outline-none"/></div>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {cargando ? <p>Cargando clientes...</p> : filtrados.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtrados.map(c => <CardCliente key={c._id} cliente={c} editar={cliente => {setEditando(cliente);setModal(true);}}/>)}</div> : <p className="rounded-2xl border bg-white p-10 text-center text-slate-500">No hay clientes para mostrar.</p>}
    {modal && <ModalCliente key={editando?._id || "nuevo"} cliente={editando} guardar={guardar} cerrar={() => setModal(false)} guardando={guardando}/>}
  </section>;
}
