import { useEffect, useMemo, useState } from "react";
import { X, CalendarDays, UserRound, MapPin, Layers3, Heart, Banknote, ClipboardList, ImagePlus, Save, ChevronRight } from "lucide-react";
import { obtenerClientes } from "../../clientes/services/clientesService";
import { crearRegistroVenta } from "../services/registroVentasService";
import AlertaModal from "../../../components/ui/AlertaModal";

const hoy=()=>new Date().toLocaleDateString("en-CA");
const inicial={fechaVenta:hoy(),fechaEntrega:"",vendedor:"",cliente:"",nombreCliente:"",telefonoCliente:"",localidad:"",pasillo:"",gaveta:"",modeloLapida:"",materialLapida:"",nombreDifunto:"",fechaNacimiento:"",fechaDefuncion:"",epitafio:"",imagen:"",precioTotal:"",anticipo:"",observaciones:""};
const secciones=[["Información general",CalendarDays],["Cliente y ubicación",UserRound],["Producto",Layers3],["Grabado de lápida",Heart],["Control financiero",Banknote],["Observaciones",ClipboardList]];
const campo="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#124B91] focus:ring-2 focus:ring-blue-100";
const label="mb-1.5 block text-xs font-extrabold text-slate-600";
export default function RegistroVentaModal({onClose,onGuardado}){
 const [form,setForm]=useState(inicial);
 const [clientes,setClientes]=useState([]);
 const [paso,setPaso]=useState(0);
 const [alerta,setAlerta]=useState(null);
 const [guardando,setGuardando]=useState(false);
 useEffect(()=>{let vivo=true;obtenerClientes().then(r=>{if(vivo)setClientes(r.clientes||[]);}).catch(()=>{});return()=>{vivo=false;};},[]);
 const cambiar=(nombre,valor)=>setForm(a=>({...a,[nombre]:valor}));
 const campos={
  0:[["fechaVenta","Fecha de venta","date",true],["fechaEntrega","Fecha aproximada de entrega","date",true],["vendedor","Nombre del vendedor","text",true]],
  1:[["nombreCliente","Nombre del cliente","text",true],["telefonoCliente","Teléfono del cliente","tel"],["localidad","Localidad","text"],["pasillo","Nombre del pasillo","text"],["gaveta","Número de gaveta","text"]],
  2:[["modeloLapida","Número de modelo de la lápida","text",true],["materialLapida","Material de la lápida","text",true]],
  3:[["nombreDifunto","Nombre del difunto(a)","text",true],["fechaNacimiento","Fecha de nacimiento","date"],["fechaDefuncion","Fecha de defunción","date"],["epitafio","Oración / epitafio","textarea"],["imagen","Imagen / fotografía (URL)","url"]],
  4:[["precioTotal","Precio total del producto","number",true],["anticipo","Anticipo (pago inicial)","number",true]],
  5:[["observaciones","Observaciones y notas adicionales","textarea"]]
 };
 const saldo=useMemo(()=>Number(form.precioTotal||0)-Number(form.anticipo||0),[form.precioTotal,form.anticipo]);
 const validar=(indice)=>{
  const faltante=campos[indice].find(([nombre,, ,obligatorio])=>obligatorio&&!String(form[nombre]).trim());
  if(faltante){setAlerta({tipo:"error",titulo:"Falta información",mensaje:`Completa el campo "${faltante[1]}" para continuar.`});return false;}
  if(indice===4 && (Number(form.anticipo)<0||Number(form.precioTotal)<0||Number(form.anticipo)>Number(form.precioTotal))){setAlerta({tipo:"error",titulo:"Revisa los importes",mensaje:"El anticipo no puede superar el precio total ni haber cantidades negativas."});return false;}
  return true;
 };
 const siguiente=()=>{if(validar(paso))setPaso(p=>Math.min(5,p+1));};
 const guardar=()=>{for(let i=0;i<6;i++){if(!validar(i)){setPaso(i);return;}}
  setAlerta({tipo:"confirm",titulo:"¿Registrar esta venta?",mensaje:`Cliente: ${form.nombreCliente}\nModelo: ${form.modeloLapida}\nPrecio: ${Number(form.precioTotal).toLocaleString("es-MX",{style:"currency",currency:"MXN"})}\nSaldo pendiente: ${saldo.toLocaleString("es-MX",{style:"currency",currency:"MXN"})}`,accion:async()=>{
   setGuardando(true);
   try{await crearRegistroVenta({...form,precioTotal:Number(form.precioTotal),anticipo:Number(form.anticipo)});return {tipo:"success",titulo:"Venta registrada",mensaje:"La hoja de venta se guardó correctamente en el sistema.",completado:true};}
   catch(e){return {tipo:"error",titulo:"No se pudo guardar",mensaje:e.message};}
   finally{setGuardando(false);}
  }});
 };
 const ejecutar=async()=>{if(!alerta?.accion)return;try{setAlerta(await alerta.accion());}catch(e){setAlerta({tipo:"error",titulo:"Error",mensaje:e.message});}};
 const cerrarAlerta=()=>{const ok=alerta?.completado;setAlerta(null);if(ok){onGuardado?.();onClose();}};
 const SeccionIcono=secciones[paso][1];
 return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1631]/75 p-0 backdrop-blur-[4px] sm:p-4" onMouseDown={e=>{if(e.target===e.currentTarget&&!guardando)onClose();}}>
  <section role="dialog" aria-modal="true" aria-label="Hoja de registro de venta" className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[#f7f9fd] shadow-2xl sm:h-[94vh] sm:rounded-[28px]">
   <header className="shrink-0 bg-gradient-to-r from-[#123e83] via-[#513d79] to-[#a13f65] px-5 py-5 text-white sm:px-8">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-white/70">La Providencia · Ventas</p><h2 className="mt-1 text-2xl font-black">Hoja de registro de venta</h2><p className="mt-1 text-sm text-white/80">Control de pedidos y especificaciones de lápidas</p></div><button onClick={onClose} aria-label="Cerrar" className="rounded-xl p-2 hover:bg-white/20"><X size={23}/></button></div>
   </header>
   <div className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]">
    <nav aria-label="Secciones del formulario" className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white p-3 md:flex-col md:border-b-0 md:border-r md:p-4">
     {secciones.map(([nombre,Icono],i)=><button key={nombre} type="button" onClick={()=>{if(i<=paso||validar(paso))setPaso(i);}} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-bold transition md:w-full ${paso===i?"bg-[#124B91] text-white":"text-slate-600 hover:bg-slate-100"}`}><Icono size={17}/><span>{i+1}. {nombre}</span></button>)}
    </nav>
    <div className="min-h-0 overflow-y-auto p-4 sm:p-7">
     <div className="mb-5 flex items-center gap-3"><span className="rounded-2xl bg-blue-100 p-3 text-[#124B91]"><SeccionIcono size={23}/></span><div><p className="text-xs font-bold text-slate-500">Sección {paso+1} de 6</p><h3 className="text-xl font-extrabold text-slate-900">{secciones[paso][0]}</h3></div></div>
     <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {paso===1&&<div className="mb-5"><label className={label}>Seleccionar cliente existente (opcional)</label><select value={form.cliente} onChange={e=>{const c=clientes.find(x=>x._id===e.target.value);setForm(a=>({...a,cliente:e.target.value,nombreCliente:c?.nombre||a.nombreCliente,telefonoCliente:c?.whatsapp||a.telefonoCliente}));}} className={campo}><option value="">Capturar cliente manualmente</option>{clientes.map(c=><option key={c._id} value={c._id}>{c.nombre}</option>)}</select><p className="mt-2 text-xs text-slate-500">Puedes elegir un cliente registrado o escribir los datos sin vincularlo.</p></div>}
      <div className="grid gap-5 sm:grid-cols-2">{campos[paso].map(([nombre,titulo,tipo,obligatorio])=><div key={nombre} className={tipo==="textarea"?"sm:col-span-2":""}><label htmlFor={`venta-${nombre}`} className={label}>{titulo}{obligatorio&&<span className="ml-1 text-rose-600">*</span>}</label>{tipo==="textarea"?<textarea id={`venta-${nombre}`} rows={4} value={form[nombre]} onChange={e=>cambiar(nombre,e.target.value)} className={campo} placeholder="Escribe aquí los detalles..."/>:<input id={`venta-${nombre}`} type={tipo} step={tipo==="number"?"0.01":undefined} min={tipo==="number"?"0":undefined} value={form[nombre]} onChange={e=>cambiar(nombre,e.target.value)} className={campo} placeholder={tipo==="text"?"Escribe aquí...":undefined}/>}</div>)}</div>
      {paso===4&&<div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-5"><p className="text-sm font-semibold text-slate-600">Restante · Saldo pendiente</p><p className={`mt-2 text-3xl font-black ${saldo<0?"text-rose-700":"text-[#124B91]"}`}>{saldo.toLocaleString("es-MX",{style:"currency",currency:"MXN"})}</p><p className="mt-2 text-xs text-slate-500">Calculado automáticamente: precio total menos anticipo.</p></div>}
      {paso===3&&<p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><ImagePlus size={16}/> La imagen se registra mediante enlace URL; la subida de archivos podrá añadirse después.</p>}
     </div>
    </div>
   </div>
   <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:px-8"><p className="text-xs font-semibold text-slate-500">Los campos con * son obligatorios.</p><div className="flex gap-2">{paso>0&&<button type="button" onClick={()=>setPaso(p=>p-1)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Anterior</button>}{paso<5?<button type="button" onClick={siguiente} className="inline-flex items-center gap-2 rounded-xl bg-[#124B91] px-5 py-3 text-sm font-bold text-white">Siguiente <ChevronRight size={17}/></button>:<button type="button" onClick={guardar} disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Save size={17}/> Registrar venta</button>}</div></footer>
  </section>
  <AlertaModal alerta={alerta} onCerrar={cerrarAlerta} onConfirmar={ejecutar} procesando={guardando}/>
 </div>;
}
