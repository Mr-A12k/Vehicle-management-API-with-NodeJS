const mongoose = require("mongoose");

const vehicleSchema = mongoose.Schema({
    vehicleName: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['E-BIKE', 'BIKE', 'E-CAR', 'CAR'],
        default: 'BIKE'
    },
    personId: {
        type: mongoose.Schema.ObjectId,
        ref: "Person",
        required: true
    },
    vehicleNum: {
        type: String,
        required: true,
        unique: true
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
