const db = require('../Models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/helper');
const { string } = require('joi');

const checkPackage = async (package, teamSize) => {
    const packagePrice = await db.SessionPricing.findOne({ where: { pack: package.pack, teamSize: teamSize } });
    const deductionAmount = Number(package.price) - Number(packagePrice.perSession);

    if (deductionAmount > 0 && deductionAmount <= Number(package.price) && Number(package.price) > deductionAmount && Number(package.price) > 0) {
        return package;
    } else {
        await db.UserPackage.findOne({ where: { id: package.id } }).then(async userPackage => {
            await db.UserPackage.findOne({ where: { userId: package.userId, price: { [Op.gt]: 0 }, active: false } }).then(async userNewPackage => {
                if (userNewPackage) {
                    let carryForwardPrice = Number(userNewPackage.price) + Number(userPackage.price)
                    await userPackage.update({ active: false, price: 0 });
                    let activePackage = await userNewPackage.update({ active: true, price: carryForwardPrice });
                    return activePackage;
                } else {
                    return "User's balance is low, and there are no new packages available to activate their account.";
                }
            })

        })
    }
}

const userWalletUpdate = async (attendanceId, users) => {
    for (const user of users) {
        try {
            await db.UserWallet.findOne({ where: { "userId": user.id } }).then(async (userWallet) => {
                await db.UserPackage.findOne({ where: { "id": user.packageId } }).then(async (userPackage) => {

                    if (!userWallet) {
                        console.error('User wallet not found');
                        return 'User wallet not found';
                    }

                    let deductionAmount = Number(user.amount);

                    if (userWallet.transaction && userWallet.transaction !== null && userWallet.transaction !== "null") {
                        userWallet.transaction = (typeof userWallet.transaction === "string") ? JSON.parse(userWallet.transaction) : userWallet.transaction;
                        userWallet.transaction.push({ attendanceId, "amount": deductionAmount, package: user.package, date: new Date(), "type": "debited" });
                    } else {
                        userWallet.transaction = [{ attendanceId, "amount": deductionAmount, package: user.package, date: new Date(), "type": "debited" }];
                    }

                    const availableBalance = Number(userWallet.amount) - Number(deductionAmount);
                    const updatePackageAmount = Number(userPackage.price) - Number(deductionAmount);

                    await userWallet.update({ amount: availableBalance, transaction: userWallet.transaction });
                    await userPackage.update({ price: updatePackageAmount });

                    return true;
                });
            });
        } catch (error) {
            console.error('An error occurred at userWalletUpdate: ', error);
            return error;
        }
    }
}

const reqSendEmail = async (userId) => {
    const userWithWallet = await db.User.findOne({
        where: { id: userId }, include: [
            {
                model: db.UserWallet,
                attributes: ['id', 'amount'],
            },
        ],
        attributes: ['id', 'firstName', 'lastName', 'email'],
    });

    let sendEmailReq = {
        firstName: userWithWallet.firstName,
        lastName: userWithWallet.lastName,
        email: userWithWallet.email,
        to: userWithWallet.email,
        walletBalance: userWithWallet.UserWallet.amount,
        topic: 'lowBalance'
    }
    await sendEmail(sendEmailReq);
}

class WalletRepositories {

    static create = (body) => new Promise((resolve, reject) => {
        const { userId, data } = body;
        data.type = 'credited';

        let createUserWallet = {
            userId: userId,
            amount: data.amount,
            date: new Date(),
            transaction: []
        }
        createUserWallet.transaction.push(data);

        db.UserWallet.create(createUserWallet)
            .then(async (user) => {
                resolve(user);
            }).catch((error) => {
                reject(error);
            });
    });

    static getAll = (data) => new Promise((resolve, reject) => {
        let query = { type: 'student', delete: false };
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
        db.User.findAll({
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
        db.User.findOne({
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

    static getBalanceByUserId = (userId) => new Promise((resolve, reject) => {
        db.UserWallet.findOne({
            where: { userId: userId }
        }).then(wallet => {
            resolve(wallet);
        }).catch(err => {
            reject(err);
        });
    });

    static update = async (userId, update) => {
        try {
            const userWallet = await db.UserWallet.findOne({ where: { userId } });

            if (!userWallet) {
                throw new Error('UserWallet not found');
            }

            const currentBalance = Number(userWallet.amount);
            const updatedBalance = currentBalance + Number(update.amount);

            let existingTransactions = (typeof userWallet.transaction === "string") ? JSON.parse(userWallet.transaction) : userWallet.transaction;
            existingTransactions.push({
                type: 'credited',
                date: new Date(),
                ...update
            });
            const updatedUserWallet = await userWallet.update({ transaction: existingTransactions, amount: updatedBalance });
            return updatedUserWallet;
        } catch (error) {
            console.error('An error occurred:', error);
            throw error; // Re-throw the error to be caught by the calling code
        }
    };


    static updateWallet = (attendanceData) => new Promise(() => {
        return userWalletUpdate(attendanceData.id, attendanceData.users);
    });

    static checkBulkUserWallet = (userIds) => {
        return new Promise(async (resolve, reject) => {
            try {
                const data = [];

                for (const user of userIds) {
                    let deductionAmount = 0;
                    const userId = user.id || user;

                    try {
                        const userPack = await db.UserPackage.findOne({
                            where: { userId, active: true },
                            attributes: ['id', 'packageName', 'pack', 'price', 'active', 'userId']
                        });

                        if (!userPack) {
                            let noWalletUser = await db.User.findOne({ where: { id: userId }, attributes: ['id', 'firstName', 'lastName'] });
                            reject({ message: `${noWalletUser.firstName} ${noWalletUser.lastName} has no wallet created.` })
                        }

                        const packagePrice = await db.SessionPricing.findOne({ where: { pack: userPack.pack, teamSize: userIds.length } });
                        deductionAmount = packagePrice.perSession;
                        const userWallet = await db.UserWallet.findOne({ where: { userId } });

                        if (Number(userWallet.amount) < 50 || Number(userWallet.amount) < Number(deductionAmount)) {
                            data.push({
                                id: userId,
                                package: userPack.packageName,
                                packageId: userPack.id,
                                sign: user.sign || undefined,
                                amount: user.sign ? deductionAmount : undefined,
                                balance: user.sign ? undefined : userWallet.amount,
                                message: 'Low balance'
                            });

                            if (!user.sign) {
                                reqSendEmail(userId);
                            }
                        } else {
                            data.push({
                                id: userId,
                                package: userPack.packageName,
                                packageId: userPack.id,
                                sign: user.sign || undefined,
                                amount: user.sign ? deductionAmount : undefined,
                                balance: user.sign ? undefined : userWallet.amount
                            });
                        }
                    } catch (error) {
                        reject(error);
                        return;
                    }
                }

                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    };

    // static checkBulkUserWallet = (userIds) => {
    //     return new Promise((resolve, reject) => {
    //         db.SessionPricing.findOne({ where: { sessions: 1, teamSize: userIds.length } })
    //             .then((pricing) => {
    //                 const deductionAmount = pricing.price;
    //                 const data = [];
    //                 const promises = [];

    //                 userIds.forEach((user) => {
    //                     const userId = user.id || user;
    //                     const userPromise = db.UserWallet.findOne({ where: { userId } }).then((userWallet) => {
    //                             if (userWallet.amount < 50 || userWallet.amount < deductionAmount) {
    //                                 data.push({
    //                                     id: userId,
    //                                     sign: user.sign || undefined,
    //                                     amount: user.sign ? deductionAmount : undefined,
    //                                     balance: user.sign ? undefined : userWallet.amount,
    //                                     message: 'Low balance'
    //                                 });
    //                                 if (!user.sign) {
    //                                     reqSendEmail(userId);
    //                                 }
    //                             } else {
    //                                 data.push({
    //                                     id: userId,
    //                                     sign: user.sign || undefined,
    //                                     amount: user.sign ? deductionAmount : undefined,
    //                                     balance: user.sign ? undefined : userWallet.amount
    //                                 });
    //                             }
    //                         })
    //                         .catch((err) => {
    //                             reject(err);
    //                         });

    //                     promises.push(userPromise);
    //                 });

    //                 Promise.all(promises)
    //                     .then(() => {
    //                         resolve(data);
    //                     })
    //                     .catch((err) => {
    //                         reject(err);
    //                     });
    //             })
    //             .catch((err) => {
    //                 reject(err);
    //             });
    //     });
    // };


    static checkUserWallet = async (userId, teamSize) => {
        try {
            const userActivePackage = await db.UserPackage.findOne({ where: { userId: userId, active: true } });
            let noWalletUser = await db.User.findOne({ where: { id: userId }, attributes: ['id', 'firstName', 'lastName'] });
            if (!userActivePackage) return { message: `${noWalletUser.firstName} ${noWalletUser.lastName} have not any active package.` }
            const checkActivePackage = await checkPackage(userActivePackage, teamSize);

            if (typeof checkActivePackage !== 'string') {
                const pricing = await db.SessionPricing.findOne({ where: { pack: checkActivePackage.pack, teamSize: teamSize } });
                const userWithWallet = await db.User.findOne({ where: { id: userId }, include: [{ model: db.UserWallet, attributes: ['id', 'amount'] }], attributes: ['id', 'firstName', 'lastName', 'email'] });

                let sendEmailReq = {
                    firstName: userWithWallet.firstName,
                    lastName: userWithWallet.lastName,
                    email: userWithWallet.email,
                    to: userWithWallet.email,
                    walletBalance: userWithWallet.UserWallet.amount,
                    topic: ''
                }

                if (!userWithWallet.UserWallet) {
                    return { message: `${userWithWallet.firstName} ${userWithWallet.lastName} wallet not found` };
                }

                if (Number(userWithWallet.UserWallet.amount) < Number(pricing.perSession)) {
                    sendEmailReq.topic = 'lowBalance';
                    await sendEmail(sendEmailReq);
                    return { message: `${userWithWallet.firstName} ${userWithWallet.lastName} not enough balance for session, We send an email to notify.` };
                }

                if (Number(userWithWallet.UserWallet.amount) < 30) {
                    sendEmailReq.topic = 'lowBalance';
                    await sendEmail(sendEmailReq);
                    return { message: `${userWithWallet.firstName} ${userWithWallet.lastName} not enough balance for next session, We send an email to notify.` };
                }

                return { amount: Number(pricing.perSession), balance: Number(userWithWallet.UserWallet.amount), message: `${userWithWallet.firstName} ${userWithWallet.lastName} has enough balance in the wallet` };
            } else {
                return { message: checkActivePackage };
            }
        } catch (error) {
            throw error;
        }
    }

    // static checkUserWallet = async (userId, teamSize) => {
    //     try {
    //         const pricing = await db.SessionPricing.findOne({ where: { teamSize: teamSize } });
    //         const userWithWallet = await db.User.findOne({
    //             where: { id: userId }, include: [
    //                 {
    //                     model: db.UserWallet,
    //                     attributes: ['id', 'amount'],
    //                 },
    //             ],
    //             attributes: ['id', 'firstName', 'lastName', 'email'],
    //         });

    //         let sendEmailReq = {
    //             firstName: userWithWallet.firstName,
    //             lastName: userWithWallet.lastName,
    //             email: userWithWallet.email,
    //             to: userWithWallet.email,
    //             walletBalance: userWithWallet.UserWallet.amount,
    //             topic: ''
    //         }

    //         if (!userWithWallet.UserWallet) {
    //             return { message: 'User wallet not found' };
    //         }

    //         if (userWithWallet.UserWallet.amount < Number(pricing.price)) {
    //             sendEmailReq.topic = 'lowBalance';
    //             await sendEmail(sendEmailReq);
    //             return { message: 'Insufficient balance' };
    //         }

    //         if (userWithWallet.UserWallet.amount < 50) {
    //             sendEmailReq.topic = 'lowBalance';
    //             await sendEmail(sendEmailReq);
    //             return { message: 'Low balance' };
    //         }

    //         return { amount: Number(pricing.price), balance: userWithWallet.UserWallet.amount, message: 'User has enough balance in the wallet' };
    //     } catch (error) {
    //         throw error;
    //     }
    // }


    static getPurchasedPackages = (userId) => new Promise((resolve, reject) => {
        db.UserWallet.findOne({ where: { userId: userId } }).then(userWallet => {
            let transactions;
            if (userWallet && typeof userWallet.transaction === "string") {
                transactions = (userWallet && userWallet.transaction) ? (typeof userWallet.transaction === "string") ? JSON.parse(userWallet.transaction) : userWallet.transaction : [];
            } else {
                transactions = (userWallet && userWallet.transaction) ? (typeof userWallet.transaction === "string") ? JSON.parse(userWallet.transaction) : userWallet.transaction : [];
            }
            if (transactions.length) {
                const creditedDetails = transactions.filter(item => item.type === 'credited');
                resolve(creditedDetails);
            } else {
                resolve([]);
            }
        }).catch(err => {
            reject(err);
        });

    })

}

module.exports = WalletRepositories;