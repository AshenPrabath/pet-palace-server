// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Pet = require('../models/Pet');
const User = require('../models/User');
const DoctorAvailability = require('../models/doctorAvailability');

// Get available time slots for a doctor on a specific date
const getAvailableTimeSlots = async (doctorId, date) => {
  try {
    const doctorAvailability = await DoctorAvailability.findOne({ doctor: doctorId, date });
    if (doctorAvailability) {
      return doctorAvailability.availableSlots;  // Return available slots
    } else {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // If no availability data, calculate available slots based on the doctor's working hours
      const availableSlots = [];
      let currentTime = new Date(date);
      currentTime.setHours(doctor.startTime.getHours(), doctor.startTime.getMinutes());
      const endTimeDate = new Date(date);
      endTimeDate.setHours(doctor.endTime.getHours(), doctor.endTime.getMinutes());

      while (currentTime < endTimeDate) {
        availableSlots.push(currentTime.toISOString().slice(11, 16));  // format as HH:MM
        currentTime.setHours(currentTime.getHours() + 1);
      }

      // Save the calculated availability to the database
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

// Create an appointment
const createAppointment = async (req, res) => {
  const { petId, doctorId, date, timeSlot } = req.body;
  const userId = req.user.id; // Get the authenticated user's ID from the token

  try {
    // Check if the pet belongs to the authenticated user
    const pet = await Pet.findById(petId);
    if (!pet || pet.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only create appointments for your own pets' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const availableSlots = await getAvailableTimeSlots(doctorId, date);
    if (!availableSlots.includes(timeSlot)) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    const newAppointment = new Appointment({
      user: userId,
      pet: petId,
      doctor: doctorId,
      date,
      timeSlot,
    });

    await newAppointment.save();

    // Remove the booked time slot from doctor availability
    await DoctorAvailability.updateOne(
      { doctor: doctorId, date },
      { $pull: { availableSlots: timeSlot } }
    );

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
