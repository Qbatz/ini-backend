const sequelize = require('../config/db');
// const { customer_BankDetails } = require('../models/customers');
const { Address } = require('../models/address');

async function initDB() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.log(error);
    }
}

initDB();