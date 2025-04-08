const sequelize = require('../config/db');

async function initDB() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.log(error);
    }
}

initDB();