const { DataTypes } = require("sequelize");
const sequelize = require('../config/db')

const InvoiceTypes = sequelize.define("invoice_types", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: false
});

const Ports = sequelize.define("ports", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    port_code: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(255),
    },
    state: {
        type: DataTypes.STRING(255),
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mode: {
        type: DataTypes.STRING(255),
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: false
});

const PaymentTerm = sequelize.define("payment_term", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: false
});

const DeliveryTerm = sequelize.define("delivery_term", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: false
});

const PoforInvoice = sequelize.define("po_for_invoice", {
    invoice_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
    },
    po_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: false
});

const PackageType = sequelize.define("package_type", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: false
});

const AddInvoiceTypes = async () => {
    const defaultValues = [
        { type: "Supply" },
        { type: "Export" }
    ];

    for (const value of defaultValues) {
        await InvoiceTypes.findOrCreate({
            where: { type: value.type },
            defaults: value
        });
    }
};

const AddPortTypes = async () => {
    const defaultValues = [
        { id: 1, port_code: "MAS-ES", city: "Chennai", state: "Tamil Nadu", type: "Air", mode: "4" },
    ];

    for (const value of defaultValues) {
        await Ports.findOrCreate({
            where: { id: value.id },
            defaults: value
        });
    }
};

const AddPaymentTerm = async () => {
    const defaultValues = [
        { type: "Advance" },
        { type: "Time of delivery" },
        { type: "Credit" }
    ];

    for (const value of defaultValues) {
        await PaymentTerm.findOrCreate({
            where: { type: value.type },
            defaults: value
        });
    }
};

const AddDeliveryTerm = async () => {
    const defaultValues = [
        { type: "EXW" },
        { type: "Free carrier" },
        { type: "Incoterms" }
    ];

    for (const value of defaultValues) {
        await DeliveryTerm.findOrCreate({
            where: { type: value.type },
            defaults: value
        });
    }
};

const AddPackageType = async () => {
    const defaultValues = [
        { type: "woodern" },
    ];

    for (const value of defaultValues) {
        await PackageType.findOrCreate({
            where: { type: value.type },
            defaults: value
        });
    }
};

sequelize.sync().then(async () => {
    try {
        await AddInvoiceTypes();
        await AddPortTypes();
        await AddPaymentTerm();
        await AddDeliveryTerm();
        await AddPackageType();
        console.log("Invoice Type inserted successfully.");
    } catch (error) {
        console.error("Error inserting static values:", error);
    }
});

module.exports = { InvoiceTypes, Ports, PaymentTerm, DeliveryTerm, PoforInvoice, PackageType }