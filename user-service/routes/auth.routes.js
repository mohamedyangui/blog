const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/users', verifyToken, authController.getUsers);
router.put('/users/:id', verifyToken, authController.updateUserRole);

module.exports = router;