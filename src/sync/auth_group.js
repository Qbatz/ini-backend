const sequelize = require('../config/db');
const { Customer, AdditionalCustomersContactInfo } = require('../models/customers');

async function initDB() {
    try {
        // await Activity.sync({ alter: true });
        await AdditionalCustomersContactInfo.sync({ alter: true });
        // await seedActivityTypes();
    } catch (error) {
        console.log(error);
    }
}

initDB();
