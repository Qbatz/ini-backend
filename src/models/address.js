const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const Address = sequelize.define("address", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    address_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "address_types",
            key: "id"
        }
    },
    address_line1: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address_line2: {
        type: DataTypes.STRING(100)
    },
    address_line3: {
        type: DataTypes.STRING(100)
    },
    address_line4: {
        type: DataTypes.STRING(100)
    },
    postal_code: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    landmark: {
        type: DataTypes.STRING(100)
    },
    maplink: {
        type: DataTypes.STRING(200)
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
    tableName: "address",
    timestamps: false
});

const BankDetails = sequelize.define("bank_details", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    account_number: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    bank_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ifsc_code: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address_line1: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address_line2: {
        type: DataTypes.STRING(100)
    },
    address_line3: {
        type: DataTypes.STRING(100)
    },
    country: {
        type: DataTypes.STRING(50)
    },
    routing_bank: {
        type: DataTypes.STRING(200)
    },
    swift_code: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    routing_bank_address: {
        type: DataTypes.STRING(200),
    },
    routing_account_indusind: {
        type: DataTypes.STRING(200),
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
    tableName: "bank_details",
    timestamps: false
});

module.exports = { Address, BankDetails };
