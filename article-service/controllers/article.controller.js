const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const axios = require('axios');

exports.createArticle = async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    if (!title || !content || !req.userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const article = new Article({ title, content, image, tags, author: req.userId });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error(`Error in createArticle: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().lean();
    res.json(articles);
  } catch (err) {
    console.error(`Error in getArticles: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    console.error(`Error in getArticleById: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    if (req.userRole === 'Admin' || req.userRole === 'Editor' || (req.userRole === 'Writer' && article.author === req.userId)) {
      Object.assign(article, req.body);
      await article.save();
      res.json(article);
    } else {
      res.status(403).json({ message: 'Unauthorized' });
    }
  } catch (err) {
    console.error(`Error in updateArticle: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article deleted' });
  } catch (err) {
    console.error(`Error in deleteArticle: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { content, articleId, parentId } = req.body;
    if (!content || !articleId || !req.userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const comment = new Comment({ content, author: req.userId, article: articleId, parent: parentId || null });
    await comment.save();
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $push: { children: comment._id } });
    }
    const article = await Article.findById(articleId);
    if (article.author !== req.userId) {
      try {
        await axios.post('http://localhost:3003/api/notify', { userId: article.author, articleId, comment });
      } catch (notifyErr) {
        console.error(`Error notifying user: ${notifyErr.message}`);
      }
    }
    res.status(201).json(comment);
  } catch (err) {
    console.error(`Error in createComment: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId, parent: null })
      .populate('children')
      .lean();
    res.json(comments);
  } catch (err) {
    console.error(`Error in getComments: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};