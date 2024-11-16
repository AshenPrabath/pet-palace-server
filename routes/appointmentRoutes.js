// routes/appointmentRoutes.js
const express = require('express');
const { createAppointment, getAvailableTimeSlots, updateAppointmentStatus,getAllAppointmentsByUserId, getAllAppointmentsByDoctorId } = require('../controllers/appointmentController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get available time slots for a doctor on a specific date
router.get('/doctor/:doctorId/slots', async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query; // Date passed as query parameter

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    const availableSlots = await getAvailableTimeSlots(doctorId, new Date(date));
    res.status(200).json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available slots', error: error.message });
  }
});

// Route to create an appointment
router.post('/create',authenticateToken, createAppointment);

// Route to confirm or cancel an appointment
router.patch('/update-status',authenticateToken, updateAppointmentStatus);

router.get('/user/:userId', getAllAppointmentsByUserId);
router.get('/doctor/:doctorId', getAllAppointmentsByDoctorId);

module.exports = router;
