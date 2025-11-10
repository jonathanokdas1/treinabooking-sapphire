const db = require('../Models');
const { Op } = require('sequelize');

class UserRepositories {

    static create = (userObj) => new Promise((resolve, reject) => {
        db.User.create(userObj)
            .then(async (user) => {
                resolve(user);
            })
            .catch((error) => {
                reject(error);
            });
    });

    static getAll = (data) => new Promise((resolve, reject) => {
        let query = { where: {delete: false} };

        if (data.search) {
            query = {
                where: {
                    [Op.or]: [
                        {
                            firstName: {
                                [Op.like]: `%${data.search}%` // Search for a partial match in the first name
                            }
                        },
                        {
                            lastName: {
                                [Op.like]: `%${data.search}%` // Search for a partial match in the last name
                            }
                        },
                        {
                            email: {
                                [Op.like]: `%${data.search}%` // Search for a partial match in the email
                            }
                        }
                    ],
                    delete: false
                }
            }
        }
        db.User.findAll(query).then((users) => {
            resolve(users);
        })
            .catch((error) => {
                reject(error);
            });
    });

    static get = (userId) => new Promise((resolve, reject) => {
        db.User.findOne({ where: { id: userId, delete: false } })
            .then((users) => {
                resolve(users);
            })
            .catch((error) => {
                reject(error);
            });
    });

    static getByEmail = (userEmail) => new Promise((resolve, reject) => {
        db.User.findOne({ where: { email: userEmail } })
            .then((user) => {
                resolve(user);
            })
            .catch((error) => {
                reject(error);
            });
    });

    static update = (userId, update) => new Promise((resolve, reject) => {
        if (update.birthDate === "") update.birthDate = null;
        db.User.findOne({ where: { id: userId } }).then((user) => {
            const updatedUser = user.update(update);
            resolve(updatedUser);
        }).catch((error) => {
            reject(error);
        });
    });

    static getUserByType = (userType) => new Promise((resolve, reject) => {
        db.User.findAll({ where: { type: userType } }).then((users) => {
            resolve(users);
        }).catch((error) => {
            reject(error);
        });
    });

    static delete = (userId, update) => new Promise((resolve, reject) => {
        db.User.findOne({ where: { id: userId } }).then((user) => {
            const deletedUser = user.update({ delete: true });
            resolve(deletedUser);
        }).catch((error) => {
            reject(error);
        });
    });

}

module.exports = UserRepositories;