const sequelize = require('../config/db');
// const { customer_BankDetails } = require('../models/customers');
const { BankDetails } = require('../models/address');
const { customer_BankDetails } = require('../models/customers');

async function initDB() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.log(error);
    }
}

initDB();