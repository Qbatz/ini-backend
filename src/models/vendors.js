const { DataTypes } = require("sequelize");
const sequelize = require('../config/db')
const { Address } = require("./address");

const Vendor = sequelize.define("vendor", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    business_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    contact_person: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    contact_number: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(70),
        allowNull: true,
        // unique: true
    },
    designation: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    gst_vat: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    vendorid: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    country: {
        type: DataTypes.STRING(20),
    },
    title: {
        type: DataTypes.INTEGER
    },
    country_code: {
        type: DataTypes.INTEGER
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
    }
}, {
    timestamps: false
});

const AdditionalContactInfo = sequelize.define("additional_contact_info", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    vendorid: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    number: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(70),
        allowNull: true,
    },
    designation: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING(20),
    },
    country_code: {
        type: DataTypes.INTEGER
    },
    title: {
        type: DataTypes.INTEGER
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
    }
}, {
    tableName: "additional_contact_info",
    timestamps: false
});

module.exports = { Vendor, AdditionalContactInfo };
