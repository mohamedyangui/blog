const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const connectDB = require('./config/db.config');

const app = express();

mongoose.set('strictQuery', true);

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests, please try again later.'
}));

app.use('/api', authRoutes);

app.use((err, req, res, next) => {
  console.error(`Express error: ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

connectDB().then(() => {
  app.listen(3001, () => console.log('User Service running on port 3001'));
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});