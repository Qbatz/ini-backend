const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const User = sequelize.define('auth_group', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'auth_group', // Set table name explicitly
    timestamps: true,  // Adds createdAt and updatedAt fields
});

const UserEmailVerify = sequelize.define("user_email_verify", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(70),
        allowNull: false,
        validate: {
            isEmail: true, // Ensures valid email format
        },
    },
    verify_code: {
        type: DataTypes.STRING(70),
        allowNull: false,
    },
    is_verified: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default to not verified
    },
    created_on: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_on: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    invited_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
},
    {
        tableName: "user_email_verify", // Explicitly set table name
        timestamps: false, // Disable Sequelize's default timestamps
    }
);

const AuthUser = sequelize.define("auth_user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    last_login: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_superuser: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        validate: { isEmail: true },
    },
    is_staff: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    date_joined: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "auth_user",
    timestamps: false,
});

module.exports = { User, UserEmailVerify, AuthUser };