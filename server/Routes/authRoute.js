const express = require('express');
const router = express.Router();
const AuthCtrl = require('../Controller/AuthController');

router.post('/login', AuthCtrl.login);
router.get('/me', AuthCtrl.me);

module.exports = router;