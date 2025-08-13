const router = require('express').Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// GET all appointments for the logged-in doctor
router.get('/appointments', auth('doctor'), async (req,res)=>{
  const apps = await Appointment.find({ doctorId: req.user.id })
    .sort({ date:1, time:1 })
    .populate('createdBy', 'name email');
  res.json(apps);
});

// DELETE an appointment belonging to the logged-in doctor
router.delete('/appointments/:id', auth('doctor'), async (req,res)=>{
  const app = await Appointment.findOne({ _id:req.params.id, doctorId:req.user.id });
  if(!app) return res.status(404).json({message:'Not found'});
  await app.deleteOne();
  res.json({ ok:true });
});

module.exports = router;
