const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserCompany = sequelize.define('UserCompany', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    company_name: {
        type: DataTypes.STRING(70),
        allowNull: false
    },
    gstin_vat: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    established_on: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    legal_status: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    fax: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    web_site: {
        type: DataTypes.STRING(40),
        allowNull: true
    },
    nearest_airport: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    nearest_seaport: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    anual_turnover: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    no_of_emp: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reg_street_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    reg_city: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    reg_pincode: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    fact_street_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    factory_city: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    factory_pincode: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    country_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    factory_country_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    factory_state_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    reg_country_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    reg_state_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    same_address: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lock_company_info: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cin: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    pan: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    tan: {
        type: DataTypes.STRING(30),
        allowNull: true
    }
}, {
    tableName: 'user_company',
    timestamps: false
});

const UserProfile = sequelize.define('UserProfile', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    is_owner: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dob: {
        type: DataTypes.DATE
    },
    gender: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    mobile: {
        type: DataTypes.STRING(20)
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: sequelize.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: sequelize.NOW
    },
    company_id: {
        type: DataTypes.BIGINT
    },
    country_id: {
        type: DataTypes.BIGINT
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.STRING(30)
    },
    employee_mobile: {
        type: DataTypes.STRING(20)
    }
}, {
    timestamps: false,
    tableName: 'user_profile'
});

module.exports = { UserCompany, UserProfile };
