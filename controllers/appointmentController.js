// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Pet = require('../models/Pet');
const User = require('../models/User');
const DoctorAvailability = require('../models/doctorAvailability');
const moment = require('moment-timezone');

// Get available time slots for a doctor on a specific date
const getAvailableTimeSlots = async (doctorId, date) => {
  try {
    // Fetch existing availability for the doctor and date
    const doctorAvailability = await DoctorAvailability.findOne({ doctor: doctorId, date });
    if (doctorAvailability) {
      return doctorAvailability.availableSlots; // Return saved slots
    } else {
      // Fetch doctor details
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // Extract and parse times
      const [startHour, startMinute] = doctor.startTime.split(':').map(Number);
      const [endHour, endMinute] = doctor.endTime.split(':').map(Number);

      // Create date objects using the provided date
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0); // Use local server time
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      // Generate time slots
      const availableSlots = [];
      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        availableSlots.push(
          currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) // HH:MM format
        );
        currentTime.setHours(currentTime.getHours() + 1);
      }

      // Save availability to the database
      const newAvailability = new DoctorAvailability({
        doctor: doctorId,
        date,
        availableSlots,
      });
      await newAvailability.save();

      return availableSlots;
    }
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

const createAppointment = async (req, res) => {
  const { petId, doctorId, date, timeSlot } = req.body;
  const userId = req.user.id;

  try {
    console.log('Received Data:', { petId, doctorId, date, timeSlot });

    // Normalize date to the start of the day in UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    console.log('Normalized Date:', normalizedDate);

    // Check if the pet belongs to the authenticated user
    const pet = await Pet.findById(petId);
    if (!pet || pet.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only create appointments for your own pets' });
    }

    // Validate doctor existence
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the requested time slot is available
    const doctorAvailability = await DoctorAvailability.findOne({
      doctor: doctorId,
      date: normalizedDate,
    });
    console.log('Doctor Availability:', doctorAvailability);

    if (!doctorAvailability) {
      return res.status(404).json({ message: 'Doctor availability not found for this date' });
    }

    if (!doctorAvailability.availableSlots.includes(timeSlot)) {
      console.log(`Time slot ${timeSlot} not found in available slots:`, doctorAvailability.availableSlots);
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Prevent duplicate appointments for the same time slot
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: normalizedDate,
      timeSlot,
    });

    if (existingAppointment) {
      console.log('Existing appointment found:', existingAppointment);
      return res.status(400).json({ message: 'Appointment already exists for this time slot' });
    }

    // Create the appointment
    const newAppointment = new Appointment({
      user: userId,
      pet: petId,
      doctor: doctorId,
      date: normalizedDate,
      timeSlot,
    });

    await newAppointment.save();
    console.log('New appointment created:', newAppointment);

    // Update doctor's availability: remove the booked slot
    const updatedAvailability = await DoctorAvailability.updateOne(
      { doctor: doctorId, date: normalizedDate },
      { $pull: { availableSlots: timeSlot } }
    );
    console.log('Updated Availability Result:', updatedAvailability);

    res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Confirm or cancel an appointment (by the doctor)
const updateAppointmentStatus = async (req, res) => {
  const { appointmentId, status } = req.body;
  const doctorId = req.user.id; // Get the authenticated doctor's ID from the token

  try {
    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Ensure that the authenticated doctor is assigned to the appointment
    if (appointment.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'You are not authorized to update this appointment' });
    }

    // Only doctors can confirm, cancel, or complete the appointment
    if (status === 'confirmed' || status === 'cancelled' || status === 'completed') {
      appointment.status = status;
      await appointment.save();

      // Restore the slot if cancelled or completed
      if (status === 'cancelled' || status === 'completed') {
        await DoctorAvailability.updateOne(
          { doctor: appointment.doctor, date: appointment.date },
          { $addToSet: { availableSlots: appointment.timeSlot } }
        );
      }

      res.status(200).json({ message: `Appointment ${status}` });
    } else {
      res.status(400).json({ message: 'Invalid status' });
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllAppointmentsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch appointments and populate the user, pet, and doctor fields
        const appointments = await Appointment.find({ user: userId })
            .populate('user')  // Populate the 'user' field with full user details
            .populate('pet')   // Populate the 'pet' field with full pet details
            .populate('doctor'); // Populate the 'doctor' field with full doctor details

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments by user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const getAllAppointmentsByDoctorId = async (req, res) => {
    const { doctorId } = req.params;

    try {
        const appointments = await Appointment.find({ doctor: doctorId })
        .populate('user')  // Populate the 'user' field with full user details
            .populate('pet')   // Populate the 'pet' field with full pet details
            .populate('doctor');
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments by doctor:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
  createAppointment,
  getAvailableTimeSlots,
  updateAppointmentStatus,
  getAllAppointmentsByUserId,
  getAllAppointmentsByDoctorId
};
