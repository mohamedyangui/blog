const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = 'user-service-secret';
const refreshSecret = 'user-service-refresh-secret';

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        message: existingUser.email === email 
          ? 'Email already exists' 
          : 'Username already exists' 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role: 'Reader' });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(`Error in register: ${err.message}`);
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: Object.keys(err.keyValue)[0] === 'email' 
          ? 'Email already exists' 
          : 'Username already exists' 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, refreshSecret, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();
    res.json({ token, refreshToken });
  } catch (err) {
    console.error(`Error in login: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Missing refresh token' });
    }
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    const newToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (err) {
    console.error(`Error in refreshToken: ${err.message}`);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const users = await User.find({}, 'username email role').lean();
    res.json(users);
  } catch (err) {
    console.error(`Error in getUsers: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { role } = req.body;
    if (!['Admin', 'Editor', 'Writer', 'Reader'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(`Error in updateUserRole: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};