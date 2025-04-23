const sequelize = require('../config/db');
const { Activity, ActivityTypes,seedActivityTypes } = require('../models/activites');

async function initDB() {
    try {
        // await Activity.sync({ alter: true });
        await ActivityTypes.sync({ alter: true });
        await seedActivityTypes();
    } catch (error) {
        console.log(error);
    }
}

initDB();
