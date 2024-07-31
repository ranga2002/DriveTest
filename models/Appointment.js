const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    isTimeSlotAvailable: {
        type: Boolean,
        default: true
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
