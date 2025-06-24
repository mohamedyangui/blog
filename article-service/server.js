const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const articleRoutes = require('./routes/article.routes');
const connectDB = require('./config/db.config');

const app = express();

app.use(cors({ origin: 'http://localhost:4200', optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
}));

connectDB()
  .then(() => console.log('Connected to MongoDB (article-service)'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', articleRoutes);

app.use((err, req, res, next) => {
  console.error(`Express error: ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = 3002;
app.listen(PORT, () => console.log(`ArticleService running on port ${PORT}`));