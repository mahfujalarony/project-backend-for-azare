const express = require('express');
const { createAddress, getAddresses, deleteAddress } = require('../controllers/addressController.js');
//import { createAddress, getAddresses } from '../controllers/addressController.js';
const { protect } = require('../auth/authMiddleware.js');

const router = express.Router();

router.post('/create', protect, createAddress);   
router.get('/getaddress', protect, getAddresses); 
router.delete('/delete/:id', protect, deleteAddress);    

module.exports = router;
