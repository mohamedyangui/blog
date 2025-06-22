const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/', verifyToken, articleController.createArticle);
router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticleById);
router.put('/:id', verifyToken, articleController.updateArticle);
router.delete('/:id', verifyToken, articleController.deleteArticle);
router.post('/comments', verifyToken, articleController.createComment);
router.get('/comments/:articleId', articleController.getComments);

module.exports = router;