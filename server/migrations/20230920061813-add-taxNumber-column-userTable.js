'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'taxNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'mobile',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'taxNumber');
  },
};
