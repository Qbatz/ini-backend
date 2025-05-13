const { DataTypes } = require("sequelize");
const sequelize = require('../config/db')

const PurchaseOrders = sequelize.define('purchase_orders', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    po_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    vendor_id: {
        type: DataTypes.STRING(50),
    },
    amount: {
        type: DataTypes.BIGINT,
    },
    po_date: {
        type: DataTypes.DATE,
    },
    discounts: {
        type: DataTypes.BIGINT,
    },
    ordered_from: {
        type: DataTypes.STRING(50),
    },
    ordered_by: {
        type: DataTypes.STRING(50),
    },
    currency: {
        type: DataTypes.STRING(50),
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'purchase_orders',
    timestamps: false,
});

const InvoiceItems = sequelize.define('invoice_items', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    invoice_item_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    item_name: {
        type: DataTypes.STRING(250),
    },
    hsn_code: {
        type: DataTypes.STRING(50),
    },
    quantity: {
        type: DataTypes.BIGINT,
    },
    amount_per_unit: {
        type: DataTypes.BIGINT,
    },
    total_amount: {
        type: DataTypes.BIGINT,
    },
    package_no: {
        type: DataTypes.STRING(250),
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'invoice_items',
    timestamps: false,
});

const Invoice = sequelize.define('Invoice', {
    invoice_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    billing_address: {
        type: DataTypes.STRING(250),
    },
    shipping_address: {
        type: DataTypes.STRING(250),
    },
    invoice_type: {
        type: DataTypes.STRING(50),
    },
    invoice_number: {
        type: DataTypes.STRING(50),
    },
    currency: {
        type: DataTypes.STRING(50),
    },
    invoice_date: {
        type: DataTypes.DATE,
    },
    origin_of_goods: {
        type: DataTypes.STRING(50),
    },
    loading_port: {
        type: DataTypes.STRING(50),
    },
    discharge_port: {
        type: DataTypes.STRING(50),
    },
    destination_country: {
        type: DataTypes.STRING(50),
    },
    shipping_bill_no: {
        type: DataTypes.STRING(150),
    },
    shipping_bill_date: {
        type: DataTypes.DATE,
    },
    payment_reference_no: {
        type: DataTypes.STRING(150),
    },
    bill_of_lading: {
        type: DataTypes.STRING(150),
    },
    bill_of_lading_date: {
        type: DataTypes.DATE,
    },
    freight_amount: {
        type: DataTypes.BIGINT,
    },
    insurance_amount: {
        type: DataTypes.BIGINT,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'invoices',
    timestamps: false,
});

module.exports = { PurchaseOrders, InvoiceItems, Invoice }