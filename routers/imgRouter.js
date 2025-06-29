const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage } = require('../controllers/imageController');

// Configure Multer with memory storage and file validation
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Route to handle multiple image uploads
router.post('/image', upload.array('images', 10), uploadImage); // Max 10 images

module.exports = router;