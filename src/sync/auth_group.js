const sequelize = require('../config/db');
const { AdditionalCustomersContactInfo } = require('../models/customers');

async function initDB() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.log(error);
    }
}

initDB();