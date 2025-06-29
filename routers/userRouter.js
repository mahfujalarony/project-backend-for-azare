const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/UserContriller');

router.post('/registers', registerUser);
router.post('/logins', loginUser);

module.exports = router;