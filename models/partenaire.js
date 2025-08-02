const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Partenaire extends Model {
    static associate(models) {
      // Définissez ici vos associations si nécessaire
    }
  }

  Partenaire.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    identifiant: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      defaultValue: () => `PART-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
    nomStructure: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    siteWeb: { 
      type: DataTypes.STRING, 
      validate: {
        isUrl: true
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    telephone: { 
      type: DataTypes.STRING 
    },
    pays: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    departement: { 
      type: DataTypes.STRING 
    },
    ville: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    codePostal: { 
      type: DataTypes.STRING 
    },
    adresse: { 
      type: DataTypes.STRING 
    },
    motDePasse: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    logoPartenaire: { 
      type: DataTypes.STRING 
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    servicePropose: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    presentationLibre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    formuleAdhesion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'partenaire'
    }
  }, {
    sequelize,
    modelName: 'Partenaire',
    tableName: 'partenaires',
    timestamps: true,
    // Suppression du hook de cryptage automatique
    hooks: {
      beforeCreate: async (partenaire) => {
        // Validation supplémentaire si nécessaire
        if (!partenaire.nomStructure) {
          throw new Error('Le nom de la structure est obligatoire');
        }
      }
    },
    defaultScope: {
      attributes: {
        exclude: ['motDePasse'] // Exclut le mot de passe par défaut des requêtes
      }
    },
    scopes: {
      withPassword: {
        attributes: {} // Permet d'inclure le mot de passe quand nécessaire
      }
    }
  });

  return Partenaire;
};