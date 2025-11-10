'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SessionPricing extends Model {
        static associate(models) { }
    };

    SessionPricing.init({
        name: { type: DataTypes.STRING },
        pack: { type: DataTypes.STRING },
        price: { type: DataTypes.DECIMAL },
        sessions: { type: DataTypes.INTEGER },
        teamSize: { type: DataTypes.INTEGER },
        perSession: { type: DataTypes.DECIMAL }
    }, { timestamps: true, createdAt: 'createdAt', updatedAt: 'updatedAt', sequelize, modelName: 'SessionPricing', tableName: 'SessionPricing', freezeTableName: true, });

    return SessionPricing;
};
