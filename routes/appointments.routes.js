const router = require('express').Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// List current user's appointments
router.get('/', auth(), async (req, res) => {
  const apps = await Appointment.find({ createdBy: req.user.id })
    .sort({ date: 1, time: 1 })
    .select('date time reason dentist doctorId');
  res.json(apps);
});

// Create appointment (accepts doctorId OR dentist name, and date+time OR when)
router.post('/', auth(), async (req, res) => {
  try {
    let { doctorId, dentist, date, time, reason, when } = req.body;

    // Allow "when" (ISO string) OR separate date/time
    if (when && (!date || !time)) {
      const d = new Date(when);
      if (isNaN(d)) return res.status(400).json({ message: 'Invalid date/time' });
      const iso = d.toISOString();
      date = iso;                               // stored as Date by schema
      time = iso.substring(11, 16);             // HH:mm
    }

    if (!date || !time) {
      return res.status(400).json({ message: 'Missing date or time' });
    }

    // If doctorId provided, validate and fetch name (used for display)
    let dentistName = dentist || '';
    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctorId' });
      }
      const doc = await User.findById(doctorId).select('name role');
      if (!doc || doc.role !== 'doctor') {
        return res.status(400).json({ message: 'Doctor not found' });
      }
      dentistName = dentistName || doc.name;
    }

    const created = await Appointment.create({
      patientName: req.user.name || 'Patient',
      dentist: dentistName,           // keep legacy display field
      doctorId: doctorId || undefined,
      date: new Date(date),
      time,
      reason,
      createdBy: req.user.id
    });

    res.status(201).json(created);
  } catch (e) {
    console.error('Create appointment error:', e);
    // handle cast errors gracefully
    return res.status(500).json({ message: 'Server error creating appointment' });
  }
});

module.exports = router;
