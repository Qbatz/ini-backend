const { Sequelize } = require('sequelize');
const loadEnvAndYaml = require('../../configloader');
loadEnvAndYaml();

const sequelize = new Sequelize({
    database: process.env.YML_DB_NAME,
    username: process.env.YML_DB_USER,
    password: process.env.YML_DB_PASSWORD,
    host: process.env.YML_DB_HOST,
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true, // This will help you. But you will see nwe error
            rejectUnauthorized: false // This line will fix new error
        }
    },
    logging: false
});

module.exports = sequelize;
