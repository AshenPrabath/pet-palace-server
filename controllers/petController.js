// petController.js
const Pet = require('../models/Pet');
const User = require('../models/User');
const mongoose = require('mongoose');

// Register pet
const registerPet = async (req, res) => {
  const { name, type, breed, age } = req.body;
  const ownerId = req.user.id; // Use the user ID from the JWT token

  try {
    // Validate if ownerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: 'Invalid ownerId format' });
    }

    // Check if the owner exists
    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new pet
    const newPet = new Pet({ name, type, breed, age, owner: ownerId });
    await newPet.save();

    // Add the pet's ID to the user's pets array and save the user
    user.pets.push(newPet._id);
    await user.save();

    res.status(201).json({ message: 'Pet registered successfully', pet: newPet });
  } catch (error) {
    console.error('Error registering pet:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pets by userId
const getAllPetsByUserId = async (req, res) => {
  const userId = req.user.id; // Get userId from the authenticated token (JWT)

  try {
    const user = await User.findById(userId).populate('pets');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ pets: user.pets });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = { registerPet, getAllPetsByUserId };
