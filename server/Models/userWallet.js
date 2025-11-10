'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserWallet extends Model {
        static associate(models) { }
    };

    UserWallet.init({
        amount: { type: DataTypes.FLOAT },
        transaction: { type: DataTypes.JSON(DataTypes.JSONB), defaultValue: JSON.stringify([]), allowNull: false },
    }, { timestamps: true, createdAt: 'createdAt', updatedAt: 'updatedAt', sequelize, modelName: 'UserWallet', tableName: 'UserWallet', freezeTableName: true, });

    // Define the association
    UserWallet.associate = (models) => {
        UserWallet.belongsTo(models.User, { foreignKey: 'userId', allowNull: false });
    }

    return UserWallet;
};
