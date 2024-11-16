// controllers/doctorController.js
const Doctor = require('../models/Doctor');

// Register a new doctor
const registerDoctor = async (req, res) => {
  const { name, password, phone, email, appointmentCharge, startTime, endTime } = req.body;

  try {
    // Check if a doctor with the same email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Create a new doctor
    const newDoctor = new Doctor({ name, password, phone, email, appointmentCharge, startTime, endTime });
    await newDoctor.save();

    res.status(201).json({ message: 'Doctor registered successfully', doctor: newDoctor });
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
  registerDoctor,
  getAllDoctors
};
