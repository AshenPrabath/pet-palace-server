const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User registration
const registerUser = async (req, res) => {
  try {
    const { name, password, email, phone, city } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, password: hashedPassword, email, phone, city });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ message: 'Login successful',user_id:user._id, token });
  } catch (error) {
    console.error('Error during login:', error); // Log error to console
    res.status(500).json({ message: 'Error during login', error: error.message }); // Send error message
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


module.exports = { getAllUsers,registerUser,loginUser };