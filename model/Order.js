const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    image: { type: String }
  },
  
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
