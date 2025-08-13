// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // <- must match login/register
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient', index: true },
    specialty: { type: String }, // for doctors (optional)
    bio: { type: String }        // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
