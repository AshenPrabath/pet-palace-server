// models/DoctorAvailability.js
const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  availableSlots: {
    type: [String], // List of available time slots for the given date
    required: true,
  },
});

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
