const express = require('express');
const router = express.Router();
const ReportCtrl = require('../Controller/ReportController');

router.get('/all', ReportCtrl.getAll);
router.get('/', ReportCtrl.get);

module.exports = router;
