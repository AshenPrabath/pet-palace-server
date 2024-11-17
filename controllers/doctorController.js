// controllers/doctorController.js
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new doctor
const registerDoctor = async (req, res) => {
  try {
    const { name, password, phone, email, appointmentCharge, startTime, endTime } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({ name, password: hashedPassword, phone, email, appointmentCharge, startTime, endTime });
    await newDoctor.save();

    res.status(201).json({ message: 'Doctor registered successfully', doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token);
    res.status(200).json({ message: 'Login successful', user_id:doctor._id,token });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
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
  getAllDoctors,
  loginDoctor
};
