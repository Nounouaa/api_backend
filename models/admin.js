const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        identifiant: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: 'ADMIN-RIDER',
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: 'admin@rider.com',
        },
        motDePasse: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'admin',
        },
    }, {
        sequelize,
        modelName: 'Admin',
        tableName: 'admins',
        timestamps: true,
    });

    return Admin;
};