const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const UserForgotPasswordOtp = sequelize.define("user_forgot_password_otp", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    otp: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_active: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1 // Assuming 1 means active, 0 means inactive
    }
}, {
    timestamps: false, // Since created_on is handled manually
    tableName: "user_forgot_password_otp"
});

const UserMobileVerifyOtp = sequelize.define("user_mobile_verify_otp", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    mobile: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    otp: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    is_verified: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 // Assuming 0 = not verified, 1 = verified
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    failed_attempt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 // Assuming 0 means no failed attempts initially
    }
}, {
    timestamps: false, // Since created_on & updated_on are manually handled
    tableName: "user_mobile_verify_otp"
});

module.exports = { UserForgotPasswordOtp, UserMobileVerifyOtp };
