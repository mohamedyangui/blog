const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db.config');
const articleRoutes = require('./routes/article.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api', articleRoutes);

connectDB().then(() => {
  app.listen(3002, () => console.log('ArticleService running on port 3002'));
});