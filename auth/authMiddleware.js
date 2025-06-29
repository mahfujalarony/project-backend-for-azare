const jwt = require('jsonwebtoken');
const User = require('../model/UserModel');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return res.status(401).json({ message: 'No token provided' });

  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.isAdmin = async (req, res, next) => {
    let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};