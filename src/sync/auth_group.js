const sequelize = require('../config/db');
const { Products } = require('../models/products');

async function initDB() {
    try {
        await Products.sync({ alter: true });
    } catch (error) {
        console.log(error);
    }
}

initDB();