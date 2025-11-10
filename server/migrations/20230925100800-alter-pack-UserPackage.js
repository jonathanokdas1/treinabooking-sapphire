'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('UserPackage', 'pack', {
      type:  Sequelize.STRING,
      allowNull: false,
      after: 'PackageName',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserPackage', 'pack');
  },
};
