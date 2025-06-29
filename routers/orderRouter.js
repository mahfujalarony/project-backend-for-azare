const express = require('express');
const router = express.Router();
const { createOrder, getOrders, cancelOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../auth/authMiddleware');

router.post('/cash-on-delivery', protect, createOrder);
router.get('/getOrders/:userId', getOrders);
router.post('/cancelOrder/:orderId', cancelOrder);


//for admin to update order status
router.patch('/updateOrderStatus/:orderId/status', protect, updateOrderStatus);

module.exports = router;