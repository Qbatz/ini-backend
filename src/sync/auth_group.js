// const { User } = require('../models/users');
// const { Vendors } = require('../models/vendors')
const { Address } = require('../models/address')
const sequelize = require('../config/db')

async function initDB() {
    try {
        await sequelize.sync({ force: false }); // `force: true` will drop existing tables and recreate them
        // console.log('Database synced successfully!');
    } catch (error) {
        // console.error('Error syncing database:', error);
    }
}

initDB();