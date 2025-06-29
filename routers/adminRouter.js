const express = require('express');
const router = express.Router();
const { reqmakeadmin, fetchUsers, fetchAllProducts, fetchUserProfile, UpdateProduct, DeleteProduct, fetchOrders } = require('../controllers/adminController');
const { protect, isAdmin } = require('../auth/authMiddleware');

router.post('/reqmakeadmin', protect, reqmakeadmin);


// Fetch all admin requests
router.get('/fetchUsers', protect, isAdmin, fetchUsers);
router.get('/fetchProducts', fetchAllProducts);
router.get('/fetchOrders', protect, isAdmin, fetchOrders);
router.get('/userProfile/:userId', protect, fetchUserProfile);


// Update for admin
router.patch('/updateProduct/:id', protect, isAdmin, UpdateProduct);
router.delete('/deleteProduct/:id', protect, isAdmin, DeleteProduct);


module.exports = router;