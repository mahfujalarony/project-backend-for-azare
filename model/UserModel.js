const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // গুগল লগইনের জন্য false করা হয়েছে
  imgUrl: { type: String, required: false },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
}, { timestamps: true });

// Password hash করার জন্য pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) { // যদি পাসওয়ার্ড পরিবর্তন না হয় বা পাসওয়ার্ড না থাকে
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- এই মেথডটি যোগ করুন ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // যদি ইউজারের পাসওয়ার্ড সেট করা না থাকে
  return bcrypt.compare(candidatePassword, this.password);
};
// --- এই পর্যন্ত ---

module.exports = mongoose.model('User', userSchema);