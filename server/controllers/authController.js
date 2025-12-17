const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, profilePictureUrl } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      profilePictureUrl
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getUserinfo = async (req, res) => {
  // Your user info logic
  try{
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserinfo
};
