// const { User } = require('../models/users');
// const { AdditionalContactInfo } = require('../models/vendors')
const { Address } = require('../models/address')
const sequelize = require('../config/db')
const { Customers, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails } = require('../models/customers');

async function initDB() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
    }
}

initDB();