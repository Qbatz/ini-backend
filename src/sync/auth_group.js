const sequelize = require('../config/db');
const { ProductBrand } = require('../models/category');

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
