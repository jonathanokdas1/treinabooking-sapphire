const { Op } = require('sequelize');
const db = require('../Models');

class SessionPricingRepositories {

    static getAll = () => new Promise((resolve, reject) => {
        db.SessionPricing.findAll({where: {}, attributes: ['id', 'name', 'price'] }).then(async (sessionPricing) => {
            resolve(sessionPricing)
        })
            .catch((error) => {
                reject(error);
            });
    });

    static getPricing = () => new Promise((resolve, reject) => {
        db.SessionPricing.findAll({where: {}, attributes: ['id', 'name', 'price', 'perSession', 'sessions', 'teamSize'] }).then(async (sessionPricing) => {
            const pricingList = sessionPricing.reduce((acc, obj) => {
                const sessions = obj.sessions;
                if (!acc[sessions]) {
                    acc[sessions] = [];
                }
                acc[sessions].push(obj);

                return acc;
            }, {});
            resolve(pricingList)
        })
            .catch((error) => {
                reject(error);
            });
    });

    static getPackageName = (packageName) => new Promise((resolve, reject) => {
        db.SessionPricing.findOne({where: {name: packageName}, attributes: ['id', 'name', 'pack', 'price'] }).then(async (sessionPricing) => {
            resolve(sessionPricing)
        }).catch((error) => {
                reject(error);
            });
    });

}

module.exports = SessionPricingRepositories;