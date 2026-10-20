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

    medidas: { type: String, default: "", trim: true },
    fotoMedidas: { type: String, default: "" },
    piezasTotales: { type: Number, min: 1, validate: { validator: v => v == null || Number.isInteger(v), message: "Las piezas deben ser un número entero" } },
    precioTotal: { type: Number, min: 0 },

    direccionInstalacion: { type: String, default: "", trim: true },
    ubicacionMaps: { type: String, default: "", trim: true },

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
})

const Trabajo = mongoose.model("Trabajo", trabajoSchema)

module.exports = Trabajo;