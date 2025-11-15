'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'password');
  }
};