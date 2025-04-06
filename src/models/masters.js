const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const Title = sequelize.define(
    "Title",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
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
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "title",
        timestamps: false,
    }
);

const setTypes = async () => {
    const defaultValues = [
        { title: "Mr" },
        { title: "Miss" },
        { title: "Mrs" },
    ];

    for (const value of defaultValues) {
        await Title.findOrCreate({
            where: { title: value.title },
            defaults: value
        });
    }
};

sequelize.sync().then(async () => {
    try {
        await setTypes();
    } catch (error) {
        console.error("Error inserting static values:", error);
    }
});

const CommonCountry = sequelize.define(
    "CommonCountry",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(5),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(5),
            allowNull: false,
        },
        flag: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        currency_code: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        is_active: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        is_default: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_by_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_by_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "common_country",
        timestamps: false,
    }
);

const setCountry = async () => {
    const defaultValues = [
        { name: "India", code: "IN", phone: "91", currency_code: "INR" },
    ];

    for (const value of defaultValues) {
        await CommonCountry.findOrCreate({
            where: { name: value.name, code: value.code, phone: value.phone, currency_code: value.currency_code },
            defaults: value
        });
    }
};

sequelize.sync().then(async () => {
    try {
        await setCountry();
    } catch (error) {
        console.error("Error inserting static values:", error);
    }
});

module.exports = { Title, CommonCountry }