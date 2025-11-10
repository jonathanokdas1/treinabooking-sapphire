'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Booking', 'bookedAttendance', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            after: 'inviteId',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Booking', 'inviteId');
    }
};
