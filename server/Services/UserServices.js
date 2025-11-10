const UserRepositories = require('../Repositories/UserRepositories');

class UserServices {

    static addUser = async (userObj) => {
        return await UserRepositories.create(userObj);
    }

    static getUsers = async (data) => {
        return await UserRepositories.getAll(data);
    }

    static getUser = async (userId) => {
        return await UserRepositories.get(userId);
    }

    static getUserByType = async (userType) => {
        return await UserRepositories.getUserByType(userType);
    }

    static getUserByEmail = async (userEmail) => {
        return await UserRepositories.getByEmail(userEmail);
    }

    static update = async (userId, updateUser) => {
        return await UserRepositories.update(userId, updateUser);
    }

    static delete = async (userId, updateUser) => {
        return await UserRepositories.delete(userId, updateUser);
    }

}

module.exports = UserServices;