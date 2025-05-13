const sequelize = require('../config/db');
const { InvoiceTypes } = require('../models/invoice_package');
const { InvoiceItems } = require('../models/invoice');

async function initDB() {
    try {
        // await Activity.sync({ alter: true });
        await sequelize.sync({ alter: true });
        // await seedActivityTypes();
    } catch (error) {
        // console.log(error);
    }
}

initDB();
