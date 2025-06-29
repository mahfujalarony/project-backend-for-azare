const express = require('express');
const router = express.Router();
const { createReview, getAllReviews, getRatingReview, like } = require('../controllers/ReviewController');


router.post('/reviews',  createReview);
router.get('/getreviews/:productId', getAllReviews);
router.get('/getrating/:productId', getRatingReview);
router.post('/like/:reviewId', like)

module.exports = router;