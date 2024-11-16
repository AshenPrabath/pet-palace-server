// petRoutes.js
const express = require('express');
const { registerPet, getAllPetsByUserId } = require('../controllers/petController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Route for pet registration (protected by authenticateToken middleware)
router.post('/register', authenticateToken, registerPet);

// Route to get all pets by userId (protected by authenticateToken middleware)
router.get('/user/:userId', authenticateToken, getAllPetsByUserId);

module.exports = router;
