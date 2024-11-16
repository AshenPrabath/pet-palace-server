const express = require('express');
const { registerUser, getAllUsers, loginUser } = require('../controllers/userController');

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);
router.get('/users', getAllUsers);
router.post('/login', loginUser);

module.exports = router;
