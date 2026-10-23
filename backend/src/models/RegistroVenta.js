const mongoose = require("mongoose");
const schema = new mongoose.Schema({
 fechaVenta:{type:Date,required:true}, fechaEntrega:{type:Date,required:true},
 vendedor:{type:String,required:true,trim:true},
 trabajador:{type:mongoose.Schema.Types.ObjectId,ref:"Trabajador",required:true},
 cliente:{type:mongoose.Schema.Types.ObjectId,ref:"Clientes",default:null},
 nombreCliente:{type:String,required:true,trim:true},
 telefonoCliente:{type:String,default:"",trim:true},
 localidad:{type:String,default:"",trim:true},
 pasillo:{type:String,default:"",trim:true},
 gaveta:{type:String,default:"",trim:true},
 modeloLapida:{type:String,required:true,trim:true},
 materialLapida:{type:String,required:true,trim:true},
 nombreDifunto:{type:String,required:true,trim:true},
 fechaNacimiento:{type:Date,default:null},
 fechaDefuncion:{type:Date,default:null},
 epitafio:{type:String,default:"",trim:true},
 imagen:{type:String,default:""},
 precioTotal:{type:Number,required:true,min:0},
 anticipo:{type:Number,required:true,min:0},
 observaciones:{type:String,default:"",trim:true}
},{timestamps:true});
schema.virtual("saldoPendiente").get(function(){return this.precioTotal-this.anticipo;});
schema.set("toJSON",{virtuals:true});
module.exports=mongoose.model("RegistroVenta",schema);
