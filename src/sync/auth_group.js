const sequelize = require('../config/db');
const { Activity, ActivityTypes, seedActivityTypes } = require('../models/activites');
const { Products } = require('../models/products');

async function initDB() {
    try {
        // await Activity.sync({ alter: true });
        await Products.sync({ alter: true });
        // await seedActivityTypes();
    } catch (error) {
        console.log(error);
    }
}

initDB();
