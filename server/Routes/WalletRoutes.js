const express = require('express');
const router = express.Router();
const walletCtrl = require('../Controller/WalletController');

router.get('/', walletCtrl.get);
router.get('/all', walletCtrl.getAll);
router.put('/', walletCtrl.update);
router.get('/check', walletCtrl.checkUserWallet);
router.get('/purchased', walletCtrl.getPurchasedPackages);

module.exports = router;
