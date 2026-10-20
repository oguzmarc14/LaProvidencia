const mongoose=require("mongoose");
const RegistroVenta=require("../models/RegistroVenta");
const Cliente=require("../models/Clientes");
const Trabajador=require("../models/Trabajador");
const crear=async(req,res)=>{
 try{
  const d=req.body;
  const requeridos=["fechaVenta","fechaEntrega","vendedor","nombreCliente","modeloLapida","materialLapida","nombreDifunto"];
  if(requeridos.some(k=>!String(d[k]||"").trim())) return res.status(400).json({mensaje:"Completa los campos obligatorios."});
  const precio=Number(d.precioTotal),anticipo=Number(d.anticipo);
  if(!Number.isFinite(precio)||!Number.isFinite(anticipo)||precio<0||anticipo<0||anticipo>precio)return res.status(400).json({mensaje:"Verifica el precio y anticipo. El anticipo no puede superar el precio."});
  if(!mongoose.isValidObjectId(d.trabajador))return res.status(400).json({mensaje:"Selecciona un trabajador responsable."});
  if(!await Trabajador.exists({_id:d.trabajador,activo:true}))return res.status(400).json({mensaje:"El trabajador asignado no existe o está inactivo."});
  if(d.cliente && !mongoose.isValidObjectId(d.cliente))return res.status(400).json({mensaje:"Cliente inválido."});
  if(d.cliente && !await Cliente.exists({_id:d.cliente}))return res.status(404).json({mensaje:"El cliente seleccionado no existe."});
  const venta=await RegistroVenta.create({...d,precioTotal:precio,anticipo,cliente:d.cliente||null,fechaNacimiento:d.fechaNacimiento||null,fechaDefuncion:d.fechaDefuncion||null});
  res.status(201).json({mensaje:"Venta registrada correctamente.",venta});
 }catch(e){console.error(e);res.status(e.name==="ValidationError"?400:500).json({mensaje:e.name==="ValidationError"?e.message:"No se pudo registrar la venta."});}
};
const listar=async(req,res)=>{
 try{const ventas=await RegistroVenta.find().populate("trabajador","nombre activo").sort({createdAt:-1}).limit(100);res.json({ventas});}
 catch(e){console.error(e);res.status(500).json({mensaje:"No se pudieron consultar las ventas."});}
};
module.exports={crear,listar};
