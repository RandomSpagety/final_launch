const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/me  -> current user's basic info
router.get('/', auth(), async (req, res) => {
  const u = await User.findById(req.user.id).select('name email role');
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(u);
});

// PUT /api/me  -> update name/email
router.put('/', auth(), async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) return res.status(400).json({ message: 'Nothing to update' });

    if (email) {
      const taken = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (taken) return res.status(409).json({ message: 'Email already in use' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { ...(name ? { name } : {}), ...(email ? { email } : {}) } },
      { new: true, runValidators: true }
    ).select('name email role');

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/me/password  -> change password
router.put('/password', auth(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword || '', user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { $set: { passwordHash } });

    res.json({ ok: true, message: 'Password updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
