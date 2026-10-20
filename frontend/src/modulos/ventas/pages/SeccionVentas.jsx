import { useEffect, useState } from "react";
import { FileText, Plus, RefreshCw, Search, CalendarDays, MapPin, Wallet } from "lucide-react";
import RegistroVentaModal from "../../dashboard/components/RegistroVentaModal";
import { obtenerRegistrosVenta } from "../../dashboard/services/registroVentasService";
const moneda=n=>Number(n||0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});
const fecha=v=>v?new Date(v).toLocaleDateString("es-MX",{timeZone:"UTC",day:"2-digit",month:"short",year:"numeric"}):"Sin fecha";
export default function SeccionVentas(){
 const [abierto,setAbierto]=useState(false);
 const [ventas,setVentas]=useState([]);
 const [cargando,setCargando]=useState(true);
 const [error,setError]=useState("");
 const [busqueda,setBusqueda]=useState("");
 async function cargar(){setCargando(true);setError("");try{const r=await obtenerRegistrosVenta();setVentas(r.ventas||[]);}catch(e){setError(e.message);}finally{setCargando(false);}}
 useEffect(()=>{cargar();},[]);
 const filtradas=ventas.filter(v=>[v.nombreCliente,v.nombreDifunto,v.modeloLapida,v.localidad].some(x=>String(x||"").toLocaleLowerCase().includes(busqueda.toLocaleLowerCase())));
 return <section className="mx-auto max-w-7xl p-4 pb-12 sm:p-6 lg:p-10">
  <header className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] p-6 text-white shadow-[0_18px_40px_rgba(43,46,101,.2)] sm:p-9">
   <div className="flex flex-wrap items-center justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/75">La Providencia · Administración</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Registro de ventas</h1><p className="mt-2 text-sm text-white/85">Control de pedidos y especificaciones de lápidas.</p></div><button onClick={()=>setAbierto(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#123e83] hover:bg-blue-50"><Plus size={18}/> Nueva venta</button></div>
  </header>
  <div className="mt-6 flex flex-wrap gap-3"><label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><Search size={18} className="text-slate-400"/><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por cliente, difunto, modelo o localidad..." className="min-w-0 flex-1 outline-none"/></label><button onClick={cargar} disabled={cargando} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#124B91] disabled:opacity-50"><RefreshCw size={17} className={cargando?"animate-spin":""}/> Actualizar</button></div>
  {error&&<p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
  {cargando?<p className="mt-8 text-center text-slate-500">Cargando ventas...</p>:filtradas.length===0?<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center"><FileText className="mx-auto mb-3 text-[#124B91]" size={30}/><h2 className="font-extrabold text-slate-900">{busqueda?"Sin coincidencias":"Todavía no hay ventas registradas"}</h2><p className="mt-2 text-sm text-slate-500">{busqueda?"Prueba con otra búsqueda.":"Presiona Nueva venta para capturar tu primera hoja."}</p></div>:<div className="mt-6 grid gap-4 lg:grid-cols-2">{filtradas.map(v=><article key={v._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-1.5 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65]"/><div className="space-y-3 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Venta registrada</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">{v.nombreCliente}</h2><p className="mt-1 text-sm text-slate-600">Lápida modelo {v.modeloLapida} · {v.materialLapida}</p></div><FileText className="text-[#124B91]" size={24}/></div><p className="text-sm text-slate-700"><strong>Difunto(a):</strong> {v.nombreDifunto}</p><p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16}/> Entrega {fecha(v.fechaEntrega)}</p>{v.localidad&&<p className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={16}/> {v.localidad}</p>}<div className="flex flex-wrap justify-between gap-2 rounded-xl bg-blue-50 p-3"><span className="flex items-center gap-1 text-sm font-bold text-[#124B91]"><Wallet size={16}/> Total: {moneda(v.precioTotal)}</span><span className="text-sm font-bold text-slate-700">Saldo: {moneda(v.precioTotal-v.anticipo)}</span></div></div></article>)}</div>}
  {abierto&&<RegistroVentaModal onClose={()=>setAbierto(false)} onGuardado={cargar}/>}
 </section>;
}
