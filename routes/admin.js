const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// List users
router.get('/users', auth('admin'), async (req,res)=>{
  const users = await User.find({}, 'name email role specialty createdAt').sort({createdAt:-1});
  res.json(users);
});

// Update user (name, role, specialty, bio)
router.put('/users/:id', auth('admin'), async (req,res)=>{
  const { name, email, role, specialty, bio } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { name, email, role, specialty, bio } },
    { new:true, runValidators:true }
  );
  if(!updated) return res.status(404).json({message:'User not found'});
  res.json(updated);
});

// Delete user
router.delete('/users/:id', auth('admin'), async (req,res)=>{
  const deleted = await User.findByIdAndDelete(req.params.id);
  if(!deleted) return res.status(404).json({message:'User not found'});
  res.json({ ok:true });
});

module.exports = router;
