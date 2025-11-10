const express = require('express');
const router = express.Router();
const BookingCtrl = require('../Controller/BookingController');

router.post('/', BookingCtrl.add);
router.get('/', BookingCtrl.get);
router.get('/all', BookingCtrl.getAll);
router.put('/', BookingCtrl.update);
router.delete('/', BookingCtrl.delete);
router.get('/checkToken', BookingCtrl.isValidToken);
router.get('/googleAuth', BookingCtrl.googleAuthReq);
router.get('/redirectURL', BookingCtrl.redirectURL);

module.exports = router;
