const sequelize = require('../config/db');
const { Vendor, AdditionalContactInfo } = require('../models/vendors');
const { Customer } = require('../models/customers');

async function initDB() {
    try {
        // await Activity.sync({ alter: true });
        await Vendor.sync({ alter: true });
        // await seedActivityTypes();
    } catch (error) {
        console.log(error);
    }
}

initDB();
