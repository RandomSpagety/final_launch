// server.js
require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// === API routes ===
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/me',           require('./routes/me'));
app.use('/api/admin',        require('./routes/admin'));          // if routes/admin.js exists
app.use('/api/doctor',       require('./routes/doctor'));         // if routes/doctor.js exists
app.use('/api/doctors',      require('./routes/doctors.routes')); // needed for the doctor dropdown
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/patients',     require('./routes/patients.routes'));

// === static files ===
app.use(express.static('public'));
app.get('/', (_req, res) => res.sendFile(__dirname + '/public/index.html'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
