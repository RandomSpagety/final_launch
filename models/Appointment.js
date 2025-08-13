// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  dentist: { type: String }, // display name
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
