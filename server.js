require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('./config/db');

const userRoutes = require('./routes/userRoutes'); // Import user routes
const petRoutes = require('./routes/petRoutes'); // Import pet routes
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
