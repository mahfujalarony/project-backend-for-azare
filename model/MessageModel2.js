const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin এবং User উভয়ই
    required: true
  },
  text: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // User বা Admin
    required: true
  },
  
  // Optional: ভবিষ্যতের জন্য
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// performance-এর জন্য index (যদি অনেক মেসেজ থাকে)
messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model('Messages', messageSchema);
