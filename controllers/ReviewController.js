const Review = require('../model/Review');
const Product = require('../model/productsModel'); // Optional: for validation
const User = require('../model/UserModel');
const mongoose = require('mongoose');

// Create a new review
const createReview = async (req, res) => {
  try {
    const { rating, review, userId, productId, user } = req.body;

    const newReview = new Review({
      rating,
      review,
      userId,
      productId,
      user,
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
};

// Get all reviews for a product (paginated)
const getAllReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 }) // Changed from "review" to "createdAt" for logical order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name imgUrl');

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err });
  }
};

// Get total reviews count and average rating
const getRatingReview = async (req, res) => {
  try {
    const { productId } = req.params;

    const totalReviews = await Review.countDocuments({
      productId: new mongoose.Types.ObjectId(productId),
    });

    const averageRating = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    const avg = averageRating[0]?.avgRating || 0;
    const roundedAvg = Math.round(avg * 10) / 10;

    res.status(200).json({
      totalReviews,
      averageRating: roundedAvg,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rating review', error });
  }
};

// Like or unlike a review
const like = async (req, res) => {
  const { reviewId } = req.params;
  const { userId, action } = req.body;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!Array.isArray(review.likedBy)) {
      review.likedBy = [];
    }

    if (action === 'like') {
      if (!review.likedBy.includes(userId)) {
        review.likes += 1;
        review.likedBy.push(userId);
      }
    } else if (action === 'unlike') {
      if (review.likedBy.includes(userId)) {
        review.likes -= 1;
        review.likedBy = review.likedBy.filter(id => id !== userId);
      }
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await review.save();
    res.json({ likes: review.likes, likedBy: review.likedBy });
  } catch (error) {
    console.error('Error processing like action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getRatingReview,
  like,
};
