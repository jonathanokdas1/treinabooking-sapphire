'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Attendance', 'bookingId', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            after: 'users',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Attendance', 'bookingId');
    }
};
