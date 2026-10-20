const mongoose = require("mongoose");
const tareaSchema = new mongoose.Schema({
 titulo:{type:String,required:true,trim:true},
 descripcion:{type:String,required:true,trim:true},
 trabajador:{type:mongoose.Schema.Types.ObjectId,ref:"Trabajador",required:true},
 trabajo:{type:mongoose.Schema.Types.ObjectId,ref:"Trabajo",default:null},
 fechaInicio:{type:Date,required:true},
 fechaLimite:{type:Date,required:true},
 prioridad:{type:String,enum:["baja","media","alta","urgente"],default:"media"},
 estado:{type:String,enum:["pendiente","en_proceso","finalizada"],default:"pendiente"},
 progreso:{type:Number,min:0,max:100,default:0},
 comentarios:[{texto:String,fecha:{type:Date,default:Date.now}}],
 fechaFinalizacion:{type:Date,default:null}
},{timestamps:true});
module.exports=mongoose.model("Tarea",tareaSchema);