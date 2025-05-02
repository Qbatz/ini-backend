const sequelize = require('../config/db');
const { Vendor, AdditionalContactInfo } = require('../models/vendors');

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
