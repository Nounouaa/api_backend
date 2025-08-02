const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {

    const Member = sequelize.define('Member', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        identifiant: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            defaultValue: () => `RIDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        },
        nom: { type: DataTypes.STRING, allowNull: false },
        prenom: { type: DataTypes.STRING, allowNull: false },
        pseudo: { type: DataTypes.STRING, allowNull: true },
        pays: { type: DataTypes.STRING, allowNull: false },
        departement: { type: DataTypes.STRING, allowNull: true },
        ville: { type: DataTypes.STRING, allowNull: false },
        codePostal: { type: DataTypes.STRING, allowNull: true },
        adresse: { type: DataTypes.STRING, allowNull: true },
        telephone: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        motDePasse: { type: DataTypes.STRING, allowNull: false },
        codeInvitation: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            defaultValue: () => Math.random().toString(36).substr(2, 8).toUpperCase()
        },
        photoAvatar: { 
            type: DataTypes.STRING, 
            allowNull: true,
            get() {
              const rawValue = this.getDataValue('photoAvatar');
              if (!rawValue) return null;
              return rawValue.includes('\\') 
                ? rawValue.split('\\').pop() // Windows path
                : rawValue.split('/').pop(); // Unix path
            }
          },
        club: { type: DataTypes.STRING, allowNull: true },
        apropos: { type: DataTypes.TEXT, allowNull: true },
        descriptionMoto: { type: DataTypes.TEXT, allowNull: true },
        photos: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
        liensYoutube: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
        photoMoto: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
        vosVoyages: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
        vosAlertes: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'membre', // ici tu forces le rôle "membre"
        },

    }, {
        sequelize,
        modelName: 'Member',
        tableName: 'members',
        timestamps: true,
        hooks: {
            beforeCreate: async(member) => {
                const salt = await bcrypt.genSalt(10);
                member.motDePasse = await bcrypt.hash(member.motDePasse, salt);
            }
        }
    })
    return Member;
}