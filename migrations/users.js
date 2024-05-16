'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
                unique: true
            },
            email: {
                allowNull: false,
                type: Sequelize.STRING,
                unique: true
            },
            phonenumber: {
                allowNull: false,
                type: Sequelize.STRING,
                unique: true
            },
            password: {
                allowNull: false,
                type: Sequelize.STRING
            },
            role: {
                allowNull: false,
                type: Sequelize.STRING
            },
            status: {
                allowNull: false,
                type: Sequelize.STRING,
                defaultValue: 'ACTIVATE'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.BIGINT
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.BIGINT
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    }
};
