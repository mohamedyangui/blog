const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true, index: true },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);