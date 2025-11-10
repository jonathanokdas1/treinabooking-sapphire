const WalletRepositories = require('../Repositories/WalletRepositories');

class WalletServices {

    static add = async (userObj) => {
        return await WalletRepositories.create(userObj);
    }

    static getAll = async (data) => {
        return await WalletRepositories.getAll(data);
    }

    static getWallet = async (userId) => {
        return await WalletRepositories.get(userId);
    }

    static update = async (userId, updateUser) => {
        return await WalletRepositories.update(userId, updateUser);
    }

    static checkUserWallet = async (userId, teamSize) => {
        return await WalletRepositories.checkUserWallet(userId, teamSize);
    }

    static getPurchasedPackages = async (userId) => {
        return await WalletRepositories.getPurchasedPackages(userId);
    }

}

module.exports = WalletServices;