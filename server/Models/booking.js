'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Booking extends Model {
        static associate(models) { }
    };

    Booking.init({
        userCount: { type: DataTypes.INTEGER, allowNull: false },
        startDate: { type: DataTypes.TIME, allowNull: false },
        endDate: { type: DataTypes.TIME, allowNull: false },
        users: { type: DataTypes.JSON(DataTypes.JSONB), defaultValue: JSON.stringify([]), allowNull: false },
        title: { type: DataTypes.STRING, allowNull: true },
        inviteId: { type: DataTypes.STRING, allowNull: true },
        delete: { type: DataTypes.BOOLEAN, defaultValue: false },
        bookedAttendance: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, { timestamps: true, createdAt: 'createdAt', updatedAt: 'updatedAt', sequelize, modelName: 'Booking', tableName: 'Booking', freezeTableName: true, });


    // Define the association
    Booking.associate = (models) => {
        Booking.belongsTo(models.User, { foreignKey: 'trainer', as: 'trainerDetails', });
        Booking.belongsTo(models.User, { foreignKey: 'createdBy', as: 'createdByDetails' });
        Booking.hasOne(models.Attendance, { foreignKey: 'bookingId' });
    }

    return Booking;
};
