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
    city: {
        type: DataTypes.STRING(100),
    },
    state: {
        type: DataTypes.STRING(100),
    },
    country: {
        type: DataTypes.STRING(100),
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
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'INR'
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
    isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

const AddressType = sequelize.define(
    "AddressType",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "address_types",
        timestamps: false,
    }
);

const seedAddressTypes = async () => {
    const defaultValues = [
        { type: "Office Address" },
        { type: "Shipping Address" },
        { type: "Home Address" },
    ];

    for (const value of defaultValues) {
        await AddressType.findOrCreate({
            where: { type: value.type },
            defaults: value
        });
    }
};

sequelize.sync().then(async () => {
    try {
        await seedAddressTypes();
        // console.log("Static values inserted successfully.");
    } catch (error) {
        console.error("Error inserting static values:", error);
    }
});

module.exports = { Address, BankDetails, AddressType };
