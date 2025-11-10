const express = require('express');
const router = express.Router();
const AttendanceCtrl = require('../Controller/AttendanceController');

router.post('/', AttendanceCtrl.add);
router.get('/', AttendanceCtrl.get);
router.get('/all', AttendanceCtrl.getAll);
router.get('/getAllByTrainer', AttendanceCtrl.getAllByTrainer);
router.get('/checkToken', AttendanceCtrl.isValidToken);
router.get('/googleAuth', AttendanceCtrl.googleAuthReq);
router.get('/redirectURL', AttendanceCtrl.redirectURL);

module.exports = router;
