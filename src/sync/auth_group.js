const sequelize = require('../config/db');
const { ProductBrand } = require('../models/category');

async function initDB() {
    try {
        await ProductBrand.sync({ alter: true });
    } catch (error) {
        console.log(error);
    }
}

initDB();