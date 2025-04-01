const { DataTypes } = require("sequelize");
const sequelize = require('../config/db')
const { Address } = require("./address");

const Customer = sequelize.define("customers", {
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
        allowNull: false,
        unique: true
    },
    designation: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    gst_vat: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    cin: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    pan: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    tan: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    statusoffirm: {
        type: DataTypes.STRING(50),
        allowNull: false,
        
    },
    natureof_business: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    customerid: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    country: {
        type: DataTypes.STRING(20),
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

const NameofBussiness = sequelize.define("nameof_bussiness", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    timestamps: false
});

const seedNameofBussiness = async () => {
    const defaultValues = [
        { type: "Manufacturing" },
        { type: "Supply of Service or Supply of Goods" }
    ];

    for (const value of defaultValues) {
        await NameofBussiness.findOrCreate({
            where: { type: value.type },
            defaults: value
        });
    }
};

const LegalStatus = sequelize.define("legal_status", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    timestamps: false,
    table_name: "legal_status"
});

const seedLegalStatus = async () => {
    const defaultValues = [
        { type: "PRIVATE LIMITED" },
        { type: "LLT _LOW LATENCY TRANSSPORT" },
        { type: "PARTNERSHIP" },
        { type: "PROPRIETORSHIP" }
    ];

    for (const value of defaultValues) {
        await LegalStatus.findOrCreate({
            where: { type: value.type },
            defaults: value
        });
    }
};

sequelize.sync().then(async () => {
    try {
        await seedNameofBussiness();
        await seedLegalStatus();
        console.log("Static values inserted successfully.");
    } catch (error) {
        console.error("Error inserting static values:", error);
    }
});

const AdditionalCustomersContactInfo = sequelize.define("additional_customers_contact_info", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    customerid: {
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
        allowNull: false,
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
    tableName: "additional_customers_contact_info",
    timestamps: false
});


const CustomerAddress = sequelize.define("customer_address", {
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
    tableName: "customer_address",
    timestamps: false
});

const customer_BankDetails = sequelize.define("customer_bank_details", {
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
    tableName: "customer_bank_details",
    timestamps: false
});

module.exports = { Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails };
