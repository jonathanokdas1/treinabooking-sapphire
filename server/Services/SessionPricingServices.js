const SessionPricingRepositories = require('../Repositories/SessionPricingRepositories');

class SessionPricingServices {

    static getAll = async () => {
        return await SessionPricingRepositories.getAll();
    }

    static getPricing = async () => {
        return await SessionPricingRepositories.getPricing();
    }

    static getPackageName = async (name) => {
        return await SessionPricingRepositories.getPackageName(name);
    }
}

module.exports = SessionPricingServices;