const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const Category = sequelize.define("category", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    category_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    category_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "category",
    timestamps: false
})

const SubCategory = sequelize.define("subcategory", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    subcategory_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    category_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    subcategory_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "subcategory",
    timestamps: false
})

const ProductBrand = sequelize.define('ProductBrand', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    brand_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    brand_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'product_brands',
    timestamps: false,
});

module.exports = { Category, SubCategory, ProductBrand }