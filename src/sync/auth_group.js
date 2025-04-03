// const { User } = require('../models/users');
// const { AdditionalContactInfo } = require('../models/vendors')
const { Address, BankDetails, AddressType } = require('../models/address')
const sequelize = require('../config/db')
const { customer_BankDetails, Customers, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress } = require('../models/customers');

async function initDB() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
    }
}

initDB();