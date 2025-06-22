const Article = require('../models/article.model');
const axios = require('axios');

exports.createArticle = async (req, res) => {
  const { title, content, image, tags } = req.body;
  const article = new Article({ title, content, image, tags, author: req.userId });
  await article.save();
  res.status(201).send(article);
};

exports.getArticles = async (req, res) => {
  const articles = await Article.find();
  res.send(articles);
};

exports.getArticleById = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send({ message: 'Article not found' });
  res.send(article);
};

exports.updateArticle = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send({ message: 'Article not found' });
  if (req.userRole === 'Admin' || req.userRole === 'Editor' || (req.userRole === 'Writer' && article.author === req.userId)) {
    Object.assign(article, req.body);
    await article.save();
    res.send(article);
  } else {
    res.status(403).send({ message: 'Unauthorized' });
  }
};

exports.deleteArticle = async (req, res) => {
  if (req.userRole !== 'Admin') return res.status(403).send({ message: 'Unauthorized' });
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).send({ message: 'Article not found' });
  res.send({ message: 'Article deleted' });
};

exports.createComment = async (req, res) => {
  const { content, articleId, parentId } = req.body;
  const comment = new Comment({ content, author: req.userId, article: articleId, parent: parentId || null });
  await comment.save();
  if (parentId) await Comment.findByIdAndUpdate(parentId, { $push: { children: comment._id } });
  const article = await Article.findById(articleId);
  if (article.author !== req.userId) {
    await axios.post('http://localhost:3003/api/notify', { userId: article.author, articleId, comment });
  }
  res.status(201).send(comment);
};

exports.getComments = async (req, res) => {
  const comments = await Comment.find({ article: req.params.articleId, parent: null }).populate('children');
  res.send(comments);
};