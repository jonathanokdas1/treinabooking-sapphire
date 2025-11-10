'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Attendance extends Model {
        static associate(models) { }
    };

    Attendance.init({
        userCount: { type: DataTypes.INTEGER, allowNull: false },
        startDate: { type: DataTypes.TIME, allowNull: false },
        endDate: { type: DataTypes.TIME, allowNull: false },
        users: { type: DataTypes.JSON(DataTypes.JSONB), defaultValue: JSON.stringify([]), allowNull: false },
        title: { type: DataTypes.STRING, allowNull: true }
    }, { timestamps: true, createdAt: 'createdAt', updatedAt: 'updatedAt', sequelize, modelName: 'Attendance', tableName: 'Attendance', freezeTableName: true, });


    // Define the association
    Attendance.associate = (models) => {
        Attendance.belongsTo(models.User, { foreignKey: 'trainer', as: 'trainerDetails', });
        Attendance.belongsTo(models.User, { foreignKey: 'createdBy', as: 'createdByDetails' });
        Attendance.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'BookingDetails' });
    }

    return Attendance;
};
