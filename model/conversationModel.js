const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessageTime: {
    type: Date,
  },
});

conversationSchema.index({ chatId: 1 });
conversationSchema.index({ productId: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
