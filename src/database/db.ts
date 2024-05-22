import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('test', 'root', 'Elvino12_', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 100,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

async function testDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
}

testDatabaseConnection();

export { sequelize, testDatabaseConnection };
