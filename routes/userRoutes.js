const express = require('express');
const { registerUser, getAllUsers, getAllAppointmentsByUserId } = require('../controllers/userController');

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);
router.get('/users', getAllUsers);

module.exports = router;
