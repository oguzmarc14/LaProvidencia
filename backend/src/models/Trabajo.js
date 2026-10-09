const mongoose = require("mongoose");

const trabajoSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },

    material:{
        type: String,
        enum: [
            "granito",
            "vidrio",
        ],
        required: true,
        trim: true
    },

    especificaciones:{
        type: String,
        required: false,
        trim: true
    },

    fechaInicio:{
        type: Date,
        required: true,
        trim: false
    },

    fechaFinal:{
        type: Date,
        required: true,
        trim: false,
    },

    estado:{
        type: String,
        enum: [
            "templado",
            "fabricacion",
            "detallado",
            "instalacion",
            "finalizado",
        ],
        default:"templado",
        required: false,
        trim: false
    },

    trabajador:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trabajador"
    },

    responsableTemple:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trabajador"
    },

    cliente:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clientes"
    },

    video:{
        type: String
    }

})

const Trabajo = mongoose.model("Trabajo", trabajoSchema)

module.exports = Trabajo;