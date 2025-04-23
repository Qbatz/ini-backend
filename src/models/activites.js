const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const Activity = sequelize.define("activity", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    activity_id: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    activity_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    transaction_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "activity",
    timestamps: false
});

const ActivityTypes = sequelize.define("activity_types", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    activity_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    activity_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by_id: {
        type: DataTypes.BIGINT
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: "activity_types",
    timestamps: false
});

const defaultActivityTypes = [
    {
        activity_type_id: 'ACT001',
        activity_name: 'Login',
    },
    {
        activity_type_id: 'ACT002',
        activity_name: 'Register',
    },
    {
        activity_type_id: 'ACT003',
        activity_name: 'Reset Password',
    },
    {
        activity_type_id: 'ACT004',
        activity_name: 'Requested user name/client id',
    },
    {
        activity_type_id: 'ACT005',
        activity_name: 'Create Client',
    },
    {
        activity_type_id: 'ACT006',
        activity_name: 'Delete client',
    },
    {
        activity_type_id: 'ACT007',
        activity_name: 'Client Address',
    },
    {
        activity_type_id: 'ACT008',
        activity_name: 'Client Bank Details',
    },
    {
        activity_type_id: 'ACT009',
        activity_name: 'Create Vendor',
    },
    {
        activity_type_id: 'ACT010',
        activity_name: 'Delete Vendor',
    },
    {
        activity_type_id: 'ACT011',
        activity_name: 'Create Product',
    },
    {
        activity_type_id: 'ACT012',
        activity_name: 'Vendor Address',
    },
    {
        activity_type_id: 'ACT013',
        activity_name: 'Vendor Bank Details',
    },
    {
        activity_type_id: 'ACT014',
        activity_name: 'Delete Product',
    },
    {
        activity_type_id: 'ACT015',
        activity_name: 'Upload Image',
    },
    {
        activity_type_id: 'ACT016',
        activity_name: 'Upload Document',
    },
    {
        activity_type_id: 'ACT017',
        activity_name: 'Delete Document',
    },
    {
        activity_type_id: 'ACT018',
        activity_name: 'Delete Image',
    },
    {
        activity_type_id: 'ACT019',
        activity_name: 'Update Vendor',
    },
    {
        activity_type_id: 'ACT020',
        activity_name: 'Update Client',
    },
    {
        activity_type_id: 'ACT021',
        activity_name: 'Update Product',
    },
    {
        activity_type_id: 'ACT022',
        activity_name: 'Category',
    },
    {
        activity_type_id: 'ACT023',
        activity_name: 'Sub Category',
    },
    {
        activity_type_id: 'ACT024',
        activity_name: 'Brand',
    }
];

async function seedActivityTypes() {
    for (const activity of defaultActivityTypes) {
        const exists = await ActivityTypes.findOne({ where: { activity_type_id: activity.activity_type_id } });
        if (!exists) {
            await ActivityTypes.create({
                ...activity,
            });
        }
    }
}



module.exports = { Activity, ActivityTypes, seedActivityTypes }