'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Booking', 'inviteId', {
            type: Sequelize.STRING(225),
            allowNull: true,
            after: 'title',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Booking', 'inviteId');
    }
};
