'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('SessionPricing', 'perSession', {
      type:  Sequelize.DECIMAL(10, 2),
      allowNull: false,
      after: 'price',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('SessionPricing', 'perSession');
  },
};
