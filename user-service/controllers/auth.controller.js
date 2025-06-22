const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = 'user-service-secret';
const refreshSecret = 'user-service-refresh-secret';

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.status(201).send({ message: 'User registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, refreshSecret, { expiresIn: '7d' });
  user.refreshToken = refreshToken;
  await user.save();
  res.send({ token, refreshToken });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  const decoded = jwt.verify(refreshToken, refreshSecret);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(403).send({ message: 'Invalid refresh token' });
  }
  const newToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
  res.send({ token: newToken });
};

exports.getUsers = async (req, res) => {
  if (req.userRole !== 'Admin') return res.status(403).send({ message: 'Unauthorized' });
  const users = await User.find({}, 'username email role');
  res.send(users);
};

exports.updateUserRole = async (req, res) => {
  if (req.userRole !== 'Admin') return res.status(403).send({ message: 'Unauthorized' });
  const user = await User.findById(req.params.id);
  user.role = req.body.role;
  await user.save();
  res.send(user);
};