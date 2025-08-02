const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Club = sequelize.define('Club', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        identifiant: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            defaultValue: () => `RIDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        },
        nomClub: { type: DataTypes.STRING, allowNull: false },
        siteWeb: { type: DataTypes.STRING, allowNull: true },
        typeClub: { type: DataTypes.STRING, allowNull: false },
        anneeCreation: { type: DataTypes.INTEGER, allowNull: true },
        nombreMembre: { type: DataTypes.INTEGER, allowNull: true },

        nomResponsable: { type: DataTypes.STRING, allowNull: false },
        prenomResponsable: { type: DataTypes.STRING, allowNull: false },

        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        telephone: { type: DataTypes.STRING, allowNull: true },
        motDePasse: { type: DataTypes.STRING, allowNull: false },

        logoClub: { type: DataTypes.STRING, allowNull: true }, // URL ou chemin

        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'club',
        },
    }, {
        sequelize,
        modelName: 'Club',
        tableName: 'clubs',
        timestamps: true,
        hooks: {
            beforeCreate: async(club) => {
                const salt = await bcrypt.genSalt(10);
                club.motDePasse = await bcrypt.hash(club.motDePasse, salt);
            },
        },
    });

    return Club;
};