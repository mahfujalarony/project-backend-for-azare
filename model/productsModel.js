const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  oldPrice: Number,
  description: String,
  brand: String,
  weight: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: 'M'
  },
  images: {
    type: [String],
    required: true
  },
  tags: {
    type: [String],
    required: true,
    validate: {
      validator: function(tags) {
        return tags.length >= 3 && tags.length <= 10;
      },
      message: 'Tags must be between 3 and 10 items'
    }
  },
  category: {
    type: String,
    required: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Discount auto calculate
productSchema.pre('save', function (next) {
  if (this.oldPrice && this.price && this.oldPrice > this.price) {
    const discount = ((this.oldPrice - this.price) / this.oldPrice) * 100;
    this.discount = Math.round(discount);
  } else {
    this.discount = 0;
  }
  next();
});

// Index for search
productSchema.index({ tags: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;