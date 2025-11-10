'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) { }
  };

  User.init({
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: false },
    mobile: { type: DataTypes.STRING },
    taxNumber: { type: DataTypes.STRING },
    birthDate: { type: DataTypes.STRING },
    gender: { type: DataTypes.ENUM, values: ['male', 'female', 'other'], allowNull: false },
    type: { type: DataTypes.ENUM, values: ['admin', 'student', 'trainer'], defaultValue: 'student', allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    delete: { type: DataTypes.BOOLEAN, defaultValue: false },
    address1: { type: DataTypes.STRING, allowNull: true  },
    address2: { type: DataTypes.STRING, allowNull: true  },
    city: { type: DataTypes.STRING, allowNull: true  },
    state: { type: DataTypes.STRING, allowNull: true  },
    pinCode: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true  },
    credits: { type: DataTypes.NUMBER },
    subscription: { type: DataTypes.STRING }
  }, { timestamps: true, createdAt: 'createdAt', updatedAt: 'updatedAt', sequelize, modelName: 'User', tableName: 'User', freezeTableName: true });


  User.associate = (models) => {
    User.hasMany(models.Attendance, { foreignKey: 'trainer', as: 'attendanceTrainer', });
    User.hasMany(models.Attendance, { foreignKey: 'createdBy', as: 'attendanceCreatedBy', });
    User.hasOne(models.UserWallet, { foreignKey: 'userId' });
  };

  return User;
};
