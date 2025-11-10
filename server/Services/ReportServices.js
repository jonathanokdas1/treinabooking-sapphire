const ReportRepositories = require('../Repositories/ReportRepositories');

class ReportServices {

    static getAll = async (data) => {
        return await ReportRepositories.getAll(data);
    }

    static get = async (data) => {
        return await ReportRepositories.get(data);
    }
}

module.exports = ReportServices;