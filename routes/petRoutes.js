const express = require('express');
const { registerPet, getAllPetsByUserId } = require('../controllers/petController');

const router = express.Router();

// Route for pet registration
router.post('/register', registerPet);
router.get('/user/:userId', getAllPetsByUserId);

module.exports = router;
