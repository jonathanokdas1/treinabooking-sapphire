const db = require('../Models');
const { Op } = require('sequelize');


class UserPackagesRepositories {

    static create = (createUserPackage) => new Promise((resolve, reject) => {
        db.UserPackage.findOne({ where: { userId: createUserPackage.userId, active: true } }).then((userPack) => {
            if (!userPack) createUserPackage.active = true;
            if (userPack && createUserPackage.status) createUserPackage.active = false;

            db.UserPackage.create(createUserPackage).then(async (user) => {
                resolve(user);
            }).catch((error) => {
                reject(error);
            });
        }).catch(err => {
            reject(err);
        })
    });

    static getAll = (data) => new Promise((resolve, reject) => {
        let query = { active: true };
        if (data.search) {
            query = {
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
                ]
            }
        }
        db.UserPackage.findAll({
            where: query, include: [
                {
                    model: db.UserWallet,
                    attributes: ['id', 'amount'],
                },
            ],
            attributes: ['id', 'firstName', 'lastName', 'email'],
        }).then(users => {
            resolve(users);
        }).catch(err => {
            reject(err);
        });
    });

    static get = (userId) => new Promise((resolve, reject) => {
        db.UserPackage.findOne({
            where: { id: userId }, include: [
                {
                    model: db.UserWallet,
                    attributes: ['id', 'amount'],
                },
            ],
            attributes: ['id', 'firstName', 'lastName', 'email'],
        }).then(user => {
            resolve(user);
        }).catch(err => {
            reject(err);
        });
    });

}

module.exports = UserPackagesRepositories;