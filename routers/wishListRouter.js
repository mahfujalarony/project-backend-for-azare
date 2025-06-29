const { addWishList, getWishLists, deleteWishList }  = require('../controllers/wishListController');
const express = require('express');
const router = express.Router();
const { protect  } = require('../auth/authMiddleware');

router.post('/addwishlist', protect, addWishList);
router.get('/getwishlist', protect, getWishLists);

router.delete('/deletewishlist/:id', protect, deleteWishList);

module.exports = router;