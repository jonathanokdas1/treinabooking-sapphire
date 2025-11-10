const UserPackagesRepositories = require('../Repositories/UserPackagesRepositories');

class UserPackagesServices {

    static add = async (userPack) => {
        return await UserPackagesRepositories.create(userPack);
    }

}

module.exports = UserPackagesServices;