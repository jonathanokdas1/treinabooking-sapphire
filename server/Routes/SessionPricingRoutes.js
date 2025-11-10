const express = require('express');
const router = express.Router();
const SessionPricingCtrl = require('../Controller/SessionPricingController');

router.get('/all', SessionPricingCtrl.getAll);
router.get('/list', SessionPricingCtrl.getPricing);

module.exports = router;
