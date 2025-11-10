'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Booking', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: true },
      trainer: { type: Sequelize.INTEGER },
      users: { type: Sequelize.JSON, defaultValue: [], allowNull: false },
      userCount: { type: Sequelize.INTEGER },
      createdBy: { type: Sequelize.INTEGER },
      startDate: { type: Sequelize.DATE },
      endDate: { type: Sequelize.DATE },
      delete: { type: Sequelize.BOOLEAN },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON   UPDATE CURRENT_TIMESTAMP') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Booking');
  }
};
