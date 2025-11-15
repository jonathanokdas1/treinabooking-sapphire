const express = require('express');
const router = express.Router();
const AuthCtrl = require('../Controller/AuthController');
const authMiddleware = require('../middleware/auth');

router.post('/login', AuthCtrl.login);
router.get('/me', authMiddleware, AuthCtrl.me);

module.exports = router;