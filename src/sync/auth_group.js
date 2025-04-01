// const { User } = require('../models/users');
// const { Vendors } = require('../models/vendors')
const { Address } = require('../models/address')
const sequelize = require('../config/db')

async function initDB() {
    try {
        await sequelize.sync({ alter: true }); // `force: true` will drop existing tables and recreate them
    } catch (error) {
    }
}

initDB();