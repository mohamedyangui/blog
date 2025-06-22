const jwt = require('jsonwebtoken');
const axios = require('axios');

module.exports = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ message: 'No token' });
  const { data } = await axios.get('http://localhost:3001/api/users', { headers: { Authorization: token } });
  const decoded = jwt.verify(token, 'user-service-secret');
  req.userId = decoded.id;
  req.userRole = decoded.role;
  next();
};