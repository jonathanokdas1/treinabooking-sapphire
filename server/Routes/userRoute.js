const express = require('express');
const router = express.Router();
const accessLog = require('../middleware/accessLog')
const userCtrl = require('../Controller/UserController');
const authMiddleware = require('../middleware/auth');

router.post('/', accessLog, userCtrl.add);
router.get('/', accessLog, userCtrl.get);
router.get('/byType', accessLog, userCtrl.getByType);
router.get('/all', authMiddleware, userCtrl.getAll);
router.put('/', accessLog, userCtrl.update);
router.delete('/', accessLog, userCtrl.delete);

module.exports = router;
