const moment = require('moment');

const WalletServices = require('../Services/WalletServices');
const SessionPricingServices = require('../Services/SessionPricingServices');
const UserPackagesServices = require('../Services/UserPackagesServices');

class WalletController {

  static getAll = async (req, res) => {
    try {
      let wallets = await WalletServices.getAll(req.query);
      return res.status(200).json({ status: 200, message: 'all user wallet list get Successfully', data: wallets });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static get = async (req, res) => {
    try {
      if (!req.query.userId) return res.status(400).json({ message: 'Please, provide userId' });
      let wallet = await WalletServices.getWallet(req.query.userId);
      return res.status(200).json({ status: 200, message: 'User wallet get successfully', data: wallet });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  static update = async (req, res) => {
    try {
      if (!req.body.userId) return res.status(400).json({ message: 'Please, provide userId' });
      if (!req.body.data.packageName) return res.status(400).json({ message: 'Please, provide packageName' });
      if (!req.body.data.amount) return res.status(400).json({ message: 'Please, provide final amount' });
      let packageInfo = await await SessionPricingServices.getPackageName(req.body.data.packageName);
      if (!packageInfo) return res.status(400).json({ message: 'Please, check package, not matching with existing' });
      req.body.data.packageInfo = packageInfo.dataValues ? packageInfo.dataValues : packageInfo;
      let wallet = await WalletServices.getWallet(req.body.userId);
      let updateWallet;
      if (wallet.dataValues && wallet.dataValues.UserWallet && wallet.dataValues.UserWallet.dataValues) {
        updateWallet = await WalletServices.update(req.body.userId, req.body.data);
      } else {
        updateWallet = await WalletServices.add(req.body);
      }
      if (updateWallet) {
        const userPackageInfo = {
          userId: updateWallet.userId,
          packageId: packageInfo.dataValues.id,
          packageName: packageInfo.dataValues.name,
          pack: packageInfo.dataValues.pack,
          price: packageInfo.dataValues.price,
          status: false,
        }
        await UserPackagesServices.add(userPackageInfo);
      }
      return res.status(200).json({ status: 200, message: 'User Wallet Updated Successfully', data: updateWallet });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static checkUserWallet = async (req, res) => {
    try {
      if (!req.query.userId) return res.status(400).json({ message: 'Please, provide userId' });
      if (!req.query.teamSize) return res.status(400).json({ message: 'Please, provide teamSize of session.' });
      let checkUserWallet = await WalletServices.checkUserWallet(req.query.userId, req.query.teamSize);
      return res.status(200).json({ status: 200, data: checkUserWallet });

    } catch (err) {
      console.error(err);
      return res.status(200).json({ message: err.message });
    }
  }

  static getPurchasedPackages = async (req, res) => {
    try {
      if (!req.query.userId) return res.status(400).json({ message: 'Please, provide userId' });
      let user = await WalletServices.getPurchasedPackages(req.query.userId);
      return res.status(200).json({ status: 200, message: user });

    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }
}

module.exports = WalletController;
