'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserPackage extends Model {
        static associate(models) { }
    };

    UserPackage.init({
        packageName: { type: DataTypes.STRING, allowNull: false },
        pack: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.DECIMAL, allowNull: false },
        active: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, { timestamps: true, createdAt: 'createdAt', updatedAt: 'updatedAt', sequelize, modelName: 'UserPackage', tableName: 'UserPackage', freezeTableName: true, });

    // Define the association
    UserPackage.associate = (models) => {
        UserPackage.belongsTo(models.User, { foreignKey: 'userId', allowNull: false });
        UserPackage.belongsTo(models.SessionPricing, { foreignKey: 'packageId', allowNull: false });
    }

    return UserPackage;
};
