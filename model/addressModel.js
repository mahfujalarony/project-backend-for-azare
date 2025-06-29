const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  thana: { type: String, required: true },
  landmark: { type: String },
  house: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
}, {
  timestamps: true,
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address; // ✅ CommonJS syntax
