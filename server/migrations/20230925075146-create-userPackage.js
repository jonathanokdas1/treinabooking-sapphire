'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserPackage', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER, },
      packageName: { type: Sequelize.STRING, allowNull: false, },
      price: { type: Sequelize.DECIMAL, allowNull: false, },
      active: { type: Sequelize.BOOLEAN, defaultValue: false, },
      userId: { type: Sequelize.INTEGER, allowNull: false, },
      packageId: { type: Sequelize.INTEGER, allowNull: false, },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON   UPDATE CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserPackage');
  },
};
