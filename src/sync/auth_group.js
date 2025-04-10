const sequelize = require('../config/db');
const { Category } = require('../models/category');

async function initDB() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        // console.log(error);
    }
}

initDB();