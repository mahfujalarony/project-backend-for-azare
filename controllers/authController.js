const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const otpStore = {};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "This email is already registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000;

  otpStore[email] = {
    otp,
    expiresAt,
    attempts: 0
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'mahfujalamrony07@gmail.com',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
};

exports.verifyOTPAndRegister = async (req, res) => {
  const { name, email, password, imgUrl, token } = req.body;
  const otp = token;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ error: "OTP expired or not sent" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }

  if (record.attempts >= 5) {
    delete otpStore[email];
    return res.status(403).json({ error: "Too many failed attempts. Please request a new OTP." });
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    return res.status(400).json({ error: `Invalid OTP. Attempts left: ${5 - record.attempts}` });
  }

  try {
    // const hashedPassword = await bcrypt.hash(password, 10); // --- এই লাইনটি সরানো হয়েছে ---
    const newUser = new User({
      name,
      email,
      password: password, // --- প্লেইন টেক্সট পাসওয়ার্ড ব্যবহার করা হচ্ছে ---
      imgUrl,
    });

    await newUser.save(); // pre('save') হুক এখন হ্যাশ করবে
    delete otpStore[email];

    const jwtToken = jwt.sign(
      {
        name: newUser.name,
        userId: newUser._id,
        email: newUser.email,
        imgUrl: newUser.imgUrl,
        role: newUser.role
      
      },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration completed successfully",
      success: true,
      token: jwtToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        imgUrl: newUser.imgUrl,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
    console.log(err);
  }
};

exports.verifyOTP = (req, res) => {
  const { email, code } = req.body;
  const token = code;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, error: "OTP expired or not send" });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, error: "OTP expired" });
  }
  if (record.attempts >= 5) {
    delete otpStore[email];
    return res.status(403).json({ success: false, error: "send anather otp" });
  }

  if (record.otp !== token) {
    record.attempts += 1;
    return res.status(400).json({
      success: false,
      error: `remaing: ${5 - record.attempts}`
    });
  }

  delete otpStore[email];
  return res.status(200).json({ success: true, message: "Success OTP verification" });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('email', email, 'password', password);
  try {
    const user = await User.findOne({ email });
    console.log('user', user);
    if (!user) {
      return res.status(401).json({ message: 'User Not Found' });
    }

    // If user registered via Google, password will be empty
    if (!user.password) {
      return res.status(400).json({ message: 'Password not set. Please login with Google or reset your password.' });
    }

    const isMatch = await user.comparePassword(password);
  
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtToken = jwt.sign(
      { 
        name: user.name,
        userId: user._id, 
        email: user.email,
        imgUrl: user.imgUrl,
        role: user.role
      },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imgUrl: user.imgUrl,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.resetPasswordSendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(409).json({ error: "No account found with this email !" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000;

  otpStore[email] = {
    otp,
    expiresAt,
    attempts: 0
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'mahfujalamrony07@gmail.com',
    to: email,
    subject: "Your Password Reset OTP Code",
    text: `Your OTP code for password reset is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
};

exports.resetPasswordVerifyOTP = (req, res) => {
  const { email, code } = req.body;
  const token = code;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, error: "OTP expired or not send" });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, error: "OTP expired" });
  }
  if (record.attempts >= 5) {
    delete otpStore[email];
    return res.status(403).json({ success: false, error: "send anather otp" });
  }

  if (record.otp !== token) {
    record.attempts += 1;
    return res.status(400).json({
      success: false,
      error: `remaing: ${5 - record.attempts}`
    });
  }

  delete otpStore[email];
  return res.status(200).json({ success: true, message: "Success OTP verification" });
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // const hashed = await bcrypt.hash(newPassword, 10); // --- এই লাইনটি সরানো হয়েছে ---
    user.password = newPassword; // --- প্লেইন টেক্সট পাসওয়ার্ড ব্যবহার করা হচ্ছে ---
    await user.save(); // pre('save') হুক এখন হ্যাশ করবে

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.googleLogin = async (req, res) => {
  const { name, email, imgUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "", // গুগল লগইনের জন্য পাসওয়ার্ড খালি থাকবে, pre('save') হুক এটি হ্যান্ডেল করবে
        imgUrl,
      });
      await user.save();
    }

    const token = jwt.sign({ 

      name: user.name, 
      userId: user._id, 
      email: user.email, 
      imgUrl: user.imgUrl , 
      role: user.role 
    
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Google Login successful",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imgUrl: user.imgUrl,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};



exports.isAdminCkk = async(req, res) => {
  try{
    const userId  = req.user._id;
    const user = await User.findById(userId).select('role');

    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    res.status(200).json({ message: 'Welcome Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}


exports.reqmakeadmin = async (req, res) => {
  const userId = req.user._id;
  const code = req.body.code;
  const AdminSecret = process.env.ADMIN_SECRET;
  if (code !== AdminSecret) {
    return res.status(403).json({ message: 'Invalid secret code' });
  }

  res.status(200).json({ message: 'Request to make admin received' });
}



exports.checkTokenValidAndResetLocalStorage = async (req, res) => {
  try {

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKey');

  
    const user = await User.findById(decoded.userId).select('name email imgUrl _id role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

   
    const newToken = jwt.sign(
      {
        name: user.name,
        userId: user._id,
        email: user.email,
        imgUrl: user.imgUrl,
        role: user.role
      },
      process.env.JWT_SECRET || 'yourSecretKey',
      { expiresIn: '7d' }
    );

    
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        _id: user._id,
        name: user.name || '',
        email: user.email || '',
        imgUrl: user.imgUrl || '',
        role: user.role || ''
      },
      token: newToken
    });

  } catch (error) {
    console.error('Token validation error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email imgUrl role phone city country gender dateOfBirth _id'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load profile', error: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'imgUrl', 'phone', 'city', 'country', 'gender', 'dateOfBirth'];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field] ?? '';
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.assign(user, updates);
    await user.save();

    const token = jwt.sign(
      {
        name: user.name,
        userId: user._id,
        email: user.email,
        imgUrl: user.imgUrl,
        role: user.role,
      },
      process.env.JWT_SECRET || 'yourSecretKey',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      token,
      user: {
        _id: user._id,
        name: user.name || '',
        email: user.email || '',
        imgUrl: user.imgUrl || '',
        role: user.role || 'user',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};


// change password
exports.changePassword = async(req, res) => {
  const userId = req.user._id;
  const {  currentPassword,  newPassword,  confirmPassword } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if(user.email && !user.password) {
    return res.status(400).json({ message: 'Password not found because you logged in using Google OAuth' });

  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // user.password = await bcrypt.hash(newPassword, 10); // --- এই লাইনটি সরানো হয়েছে ---
  user.password = newPassword; // --- প্লেইন টেক্সট পাসওয়ার্ড ব্যবহার করা হচ্ছে ---
  await user.save(); // pre('save') হুক এখন হ্যাশ করবে

  res.status(200).json({ message: 'Password changed successfully' });
}
