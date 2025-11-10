const { Op } = require('sequelize');
const moment = require('moment');
const db = require('../Models');
const WalletRepositories = require('./WalletRepositories');

const getPreviousMonthDates = (dateString) => {
    const endDate = moment(dateString, 'YYYY-MM-DD'); // Parse end date string
    const startDate = moment(endDate).subtract(30, 'days'); // Calculate start date as last 30 days from end date

    return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
    };
};

function getUserPackPurchaseDate(transactions, packName) {
    transactions = typeof transactions === 'string' ? JSON.parse(transactions) : transactions;
    const creditedTransactions = transactions.filter(transaction => transaction.type === 'credited' && transaction.packageName === packName);
    const purchaseDates = creditedTransactions.map(transaction => transaction.date ? transaction.date : transaction.purchaseDate);
    return purchaseDates[0];
}

function parseTransactions(transactions) {
    try {
        return typeof transactions === 'string' ? JSON.parse(transactions) : transactions;
    } catch (error) {
        console.error('Error parsing transactions:', error);
        return [];
    }
}

function calculateBalance(transactions, startDate, endDate) {
    let balance = 0;
    transactions.forEach(transaction => {
        const transactionDate = moment(transaction?.purchaseDate || transaction?.date, 'YYYY-MM-DD');
        if (transactionDate.isBetween(startDate, endDate, 'days', '[]')) {
            if (transaction.type === 'credited') {
                balance += parseFloat(transaction.amount);
            } else if (transaction.type === 'debited') {
                balance -= parseFloat(transaction.amount);
            }
        }
    });
    return balance.toFixed(2);
}

function getMonthBalance(transactions, flag, reqStartDate, reqEndDate) {
    let balance = 0;
    if (reqStartDate && reqEndDate) {
        const startDate = flag === 'past' ? moment(reqStartDate).subtract(30, 'day').endOf('day') : moment(reqStartDate);
        const endDate = flag === 'past' ? moment(reqStartDate).subtract(1, 'day').endOf('day') : moment(reqEndDate).endOf('day');
        transactions = parseTransactions(transactions);
        balance = calculateBalance(transactions, startDate, endDate);
    }
    return balance;
}

function generateReport(data) {
    const userStatsArray = [];

    data.forEach(item => {
        const users = item.users;
        users.forEach(user => {
            const userName = `${user.firstName} ${user.lastName}`;
            const userId = user.id;
            const walletBalance = user.balance;
            const lastMonthBalance = user.lastMonthBalance;

            let userStats = userStatsArray.find(stats => stats.userName === userName);

            if (!userStats) {
                userStats = {
                    userName: userName,
                    id: userId,
                    walletBalance: walletBalance,
                    lastMonthBalance: lastMonthBalance,
                    userTotalCoast: 0,
                    with1: 0,
                    with2: 0,
                    with3: 0,
                    with4: 0,
                    with5: 0,
                    with6: 0,
                    attendedWith: {}, // Separate attendedWith for each package
                };

                userStatsArray.push(userStats);
            }

            const numAttendees = Math.min(users.length, 10);
            const attendedWithType = numAttendees === 1 ? "Alone" : `Session with ${numAttendees} persons`;

            const sessionPackage = user.package;
            const attendedWithKey = `${attendedWithType}_${sessionPackage}`;

            if (!userStats.attendedWith[attendedWithKey]) {
                userStats.attendedWith[attendedWithKey] = {
                    count: 0,
                    sessionCost: 0,
                    totalCost: 0,
                    package: sessionPackage,
                    packPurchasedDate: [],
                };
            }
            userStats[`userTotalCoast`] += Number(user.amount);
            userStats[`with${numAttendees}`]++;
            userStats.attendedWith[attendedWithKey].count++;
            userStats.attendedWith[attendedWithKey].package = sessionPackage;

            const packagePurchasedDates = getUserPackPurchaseDate(user.transaction, user.packageName);
            userStats.attendedWith[attendedWithKey].packPurchasedDate =packagePurchasedDates;
            userStats.attendedWith[attendedWithKey].sessionCost = Number(user.amount);
            userStats.attendedWith[attendedWithKey].totalCost += Number(user.amount);
        });
    });

    // Format packPurchasedDate as per the required output
    userStatsArray.forEach(userStats => {
        userStats.attendedWith = Object.fromEntries(
            Object.entries(userStats.attendedWith).sort(([keyA], [keyB]) => {
                    if (keyA.startsWith("Alone") && !keyB.startsWith("Alone")) {
                        return -1;
                    } else if (!keyA.startsWith("Alone") && keyB.startsWith("Alone")) {
                        return 1;
                    } else {
                        return keyA.localeCompare(keyB);
                    }
                })
        );
        // Object.keys(userStats.attendedWith).forEach(sessionType => {
        //     const session = userStats.attendedWith[sessionType];
        //     session.packPurchasedDate = session.packPurchasedDate.length > 0 ? session.packPurchasedDate : [null];
        // });
    });

    return userStatsArray;
}

class AttendanceRepositories {

    static getAll = (data) => new Promise((resolve, reject) => {
        if (data.startDate && data.endDate && data.trainer) {
            let query = {};
            if (data.startDate) query.startDate = { [Op.gte]: moment(data.startDate).subtract(1, 'day').endOf('day').toISOString() }
            if (data.endDate) query.endDate = { [Op.lte]: moment(data.endDate).endOf('day').toISOString() }
            if (data.trainer) query.trainer = data.trainer;

            db.Attendance.findAll({
                where: query,
                include: [
                    { model: db.User, as: 'trainerDetails', attributes: ['id', 'firstName', 'lastName'] },
                    { model: db.User, as: 'createdByDetails', attributes: ['id', 'firstName', 'lastName'] },
                ],
            }).then(async (attendances) => {
                if (attendances.length) {
                    const attendanceWithUsers = await Promise.all(
                        attendances.map(async attendance => {
                            const attendanceUsersArray = (typeof attendance.users === "string") ? JSON.parse(attendance.users) : attendance.users;
                            const idArray = attendanceUsersArray.map(item => item.id);
                            const users = await db.User.findAll({
                                where: { id: { [Op.in]: idArray } }, include: [
                                    {
                                        model: db.UserWallet,
                                        attributes: ['amount', 'transaction'],
                                    },
                                ], attributes: ['id', 'firstName', 'lastName']
                            });
                            const mergedArray = attendanceUsersArray.map((item1) => {
                                const matchingItem2 = users.find((item2) => item2.dataValues.id == item1.id);
                                if (matchingItem2) {
                                    let transactions = matchingItem2.dataValues.UserWallet.dataValues.transaction;
                                    let getPastMonthBalance = getMonthBalance(transactions, 'past', data.startDate, data.endDate);
                                    let getCurrentMonthBalance = getMonthBalance(transactions, null, data.startDate, data.endDate);

                                    return {
                                        id: item1.id,
                                        firstName: matchingItem2.dataValues.firstName,
                                        lastName: matchingItem2.dataValues.lastName,
                                        balance: getCurrentMonthBalance,
                                        lastMonthBalance: getPastMonthBalance,
                                        sign: item1.sign,
                                        amount: item1.amount,
                                        package: item1.package,
                                        sessionDate: attendance.createdAt,
                                        transaction: matchingItem2.dataValues.UserWallet.dataValues.transaction,
                                    };
                                }
                                return item1;
                            });
                            const modifiedAttendance = { ...attendance.toJSON(), users: mergedArray };

                            return modifiedAttendance;
                        })
                    );
                    const report = generateReport(attendanceWithUsers);
                    resolve(report);
                } else {
                    resolve([])
                }
            })
                .catch((error) => {
                    reject(error);
                });
        } else {
            resolve([])
        }
    });

    // static get = (data) => new Promise((resolve, reject) => {
    //     const query = {}

    //     if (data.startDate) query.startDate = { [Op.gte]: data.startDate }
    //     if (data.endDate) query.endDate = { [Op.lte]: data.endDate }
    //     if (data.trainer) query.trainer = data.trainer

    //     db.Attendance.findOne({
    //         where: query,
    //         include: [
    //             { model: db.User, as: 'trainerDetails', attributes: ['id', 'firstName', 'lastName', 'email'] },
    //             { model: db.User, as: 'createdByDetails', attributes: ['id', 'firstName', 'lastName', 'email'] }
    //         ]
    //     }).then(async (attendances) => {
    //         if (attendances.length) {
    //             const attendanceWithUsers = await Promise.all(
    //                 attendances.map(async attendance => {
    //                     const attendanceUsersArray = JSON.parse(attendance.users);
    //                     const idArray = attendanceUsersArray.map(item => item.id);
    //                     const users = await db.User.findAll({
    //                         where: { id: { [Op.in]: idArray } }, include: [
    //                             {
    //                                 model: db.UserWallet,
    //                                 attributes: ['amount'],
    //                             },
    //                         ], attributes: ['id', 'firstName', 'lastName']
    //                     });

    //                     const mergedArray = attendanceUsersArray.map((item1) => {
    //                         const matchingItem2 = users.find((item2) => item2.dataValues.id === item1.id);
    //                         if (matchingItem2) {
    //                             return {
    //                                 id: item1.id,
    //                                 firstName: matchingItem2.dataValues.firstName,
    //                                 lastName: matchingItem2.dataValues.lastName,
    //                                 balance: matchingItem2.dataValues.UserWallet.dataValues.amount,
    //                                 sign: item1.sign,
    //                                 amount: item1.amount,
    //                             };
    //                         }
    //                         return item1;
    //                     });
    //                     const modifiedAttendance = { ...attendance.toJSON(), users: mergedArray };

    //                     return modifiedAttendance;
    //                 })
    //             );

    //             const report = generateReport(attendanceWithUsers);

    //             resolve(report);
    //         }
    //     }).catch((error) => {
    //             reject(error);
    //         });
    // });


}

module.exports = AttendanceRepositories;