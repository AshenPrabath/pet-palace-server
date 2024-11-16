// routes/doctorRoutes.js
const express = require('express');
const { registerDoctor, getAllDoctors} = require('../controllers/doctorController');

const router = express.Router();

// POST route to register a new doctor
router.post('/register', registerDoctor);
router.get('/doctors', getAllDoctors);

module.exports = router;
