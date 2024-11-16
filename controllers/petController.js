const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const User = require('../models/User');

// Register a new pet
const registerPet = async (req, res) => {
    const { name, type, breed, age, ownerId } = req.body;
  
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
const getAllPetsByUserId = async (req, res) => {
    const { userId } = req.params;
    
    try {
        const pets = await Pet.find({ owner: userId });
        res.status(200).json(pets);
    } catch (error) {
        console.error('Error fetching pets by user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
  registerPet,
  getAllPetsByUserId
};
