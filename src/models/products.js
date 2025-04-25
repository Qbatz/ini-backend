const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const Products = sequelize.define('Products', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    unique_product_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    product_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    long_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    quantity: {
        type: DataTypes.BIGINT,
        defaultValue: 1
    },
    unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    model: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    price: {
        type: DataTypes.BIGINT,
    },
    currency: {
        type: DataTypes.STRING(50),
    },
    weight: {
        type: DataTypes.STRING(50),
    },
    discount: {
        type: DataTypes.BIGINT,
    },
    hsn_code: {
        type: DataTypes.STRING(50),
    },
    gst: {
        type: DataTypes.BIGINT,
    },
    serialNo: {
        type: DataTypes.STRING(500),
    },
    category: {
        type: DataTypes.STRING(50),
    },
    brand: {
        type: DataTypes.STRING(50),
    },
    subcategory: {
        type: DataTypes.STRING(50),
    },
    make: {
        type: DataTypes.STRING(50),
    },
    origin_country: {
        type: DataTypes.STRING(50),
    },
    manufacturing_year: {
        type: DataTypes.DATE,
        allowNull: true
    },
    district: {
        type: DataTypes.STRING(50),
    },
    state: {
        type: DataTypes.STRING(50),
    },
    additional_fields: {
        type: DataTypes.JSON,
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
    updated_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
},
    {
        tableName: "Products",
        timestamps: false
    })

const Unit = sequelize.define("unit", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    product_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    updated_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "unit",
    timestamps: false
})

const Inventory = sequelize.define("inventory", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    inventory_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    product_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    category_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    subcategory_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    count: {
        type: DataTypes.BIGINT,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    updated_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "inventory",
    timestamps: false
})

const ProductImages = sequelize.define("product_images", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    image_url: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    product_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    category_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    subcategory_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    updated_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "product_images",
    timestamps: false
})

const TechnicalDocuments = sequelize.define("technical_documents", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    document_url: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    product_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    category_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    subcategory_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    updated_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "technical_documents",
    timestamps: false
})

module.exports = { Products, Unit, Inventory, ProductImages, TechnicalDocuments }