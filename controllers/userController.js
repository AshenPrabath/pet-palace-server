const User = require('../models/User');
const Pet = require('../models/Pet');

// User registration
const registerUser = async (req, res) => {
  try {
    const { name, password, email, phone, city } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, password, email, phone, city });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};
const getAllUsers = async (req, res) => {
  try {
    // Find all users and populate the 'pets' field with full pet documents
    const users = await User.find().populate('pets');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = { getAllUsers,registerUser };