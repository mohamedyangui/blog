const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  tags: [{ type: String, index: true }],
  author: { type: String, required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);