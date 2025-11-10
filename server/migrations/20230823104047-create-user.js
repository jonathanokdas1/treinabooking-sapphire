'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      firstName: { type: Sequelize.STRING },
      lastName: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      mobile: { type: Sequelize.STRING },
      birthDate: { type: Sequelize.DATE },
      gender: { type: Sequelize.STRING },
      type: { type: Sequelize.STRING },
      isActive: { type: Sequelize.BOOLEAN },
      delete: { type: Sequelize.BOOLEAN },
      address1: { type: Sequelize.STRING },
      address2: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      state: { type: Sequelize.STRING },
      pinCode: { type: Sequelize.STRING },
      country: { type: Sequelize.STRING },
      credits: { type: Sequelize.INTEGER },
      subscription: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON   UPDATE CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('User');
  }
};
