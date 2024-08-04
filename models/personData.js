const mongoose = require('mongoose');

const personSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    vehicles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle'
        }
    ]
});

const Person = mongoose.model("Person", personSchema);
module.exports = Person;
