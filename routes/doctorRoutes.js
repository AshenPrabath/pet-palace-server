// routes/doctorRoutes.js
const express = require('express');
const { registerDoctor, getAllDoctors, loginDoctor} = require('../controllers/doctorController');

const router = express.Router();

// POST route to register a new doctor
router.post('/register', registerDoctor);
router.get('/doctors', getAllDoctors);
router.post('/login', loginDoctor);

module.exports = router;
