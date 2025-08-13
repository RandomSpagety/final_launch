const router = require('express').Router();
const User = require('../models/User');

// GET /api/doctors  -> list all users with role "doctor"
router.get('/', async (_req, res) => {
  const docs = await User.find({ role: 'doctor' })
    .select('_id name email specialty');
  res.json(docs);                 // returns []
});

module.exports = router;
