const express = require('express');
const router = express.Router();
const { Partenaire } = require('../models');
const upload = require('../middleware/upload');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { partnerValidators } = require('../validators');

// Configuration
const MAX_PHOTOS = 6;
const SALT_ROUNDS = 10;

/**
 * @route POST /partenaires/login
 * @description Authentifie un partenaire avec vérification bcrypt
 */

router.post('/login', partnerValidators.login, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, motDePasse } = req.body;

    const partenaire = await Partenaire.scope('withPassword').findOne({ 
      where: { email }
    });

    if (!partenaire) {
      return res.status(404).json({
        success: false,
        message: "Identifiants invalides"
      });
    }

    const isMatch = await bcrypt.compare(motDePasse, partenaire.motDePasse);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides"
      });
    }

    const token = jwt.sign(
      {
        id: partenaire.id,
        role: 'partenaire',
        email: partenaire.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { motDePasse: _, ...safeData } = partenaire.toJSON();
    
    return res.json({
      success: true,
      token,
      partenaire: safeData
    });

  } catch (error) {
    console.error('[AUTH ERROR]', error);
    return res.status(500).json({
      success: false,
      message: "Erreur d'authentification"
    });
  }
});

/**
 * @route POST /partenaires/add
 * @description Crée un nouveau partenaire avec cryptage du mot de passe
 */
router.post('/add', 
  upload.fields([
    { name: 'logoPartenaire', maxCount: 1 },
    { name: 'photos', maxCount: MAX_PHOTOS }
  ]),
  partnerValidators.create,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { motDePasse, ...partnerData } = req.body;
      const motDePasseHash = await bcrypt.hash(motDePasse, SALT_ROUNDS);

      const nouveauPartenaire = await Partenaire.create({
        ...partnerData,
        motDePasse: motDePasseHash,
        logoPartenaire: req.files['logoPartenaire']?.[0]?.filename || null,
        photos: req.files['photos']?.map(file => file.filename) || []
      });

      const { motDePasse: _, ...responseData } = nouveauPartenaire.toJSON();
      
      return res.status(201).json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('[CREATE ERROR]', error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la création",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /partenaires/public
 * @description Liste publique des partenaires
 */
router.get('/public', async (req, res) => {
  try {
    const partenaires = await Partenaire.findAll({
      attributes: ['id', 'nomStructure', 'type', 'ville', 'logoPartenaire', 'servicePropose'],
      order: [['nomStructure', 'ASC']]
    });
    return res.json(partenaires);
  } catch (error) {
    console.error('[PUBLIC LIST ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route GET /partenaires
 * @description Liste complète des partenaires (sans mots de passe)
 */
router.get('/', async (req, res) => {
  try {
    const partenaires = await Partenaire.findAll({
      attributes: { exclude: ['motDePasse'] },
      order: [['createdAt', 'DESC']]
    });
    return res.json({
      success: true,
      count: partenaires.length,
      data: partenaires
    });
  } catch (error) {
    console.error('[LIST ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de récupération'
    });
  }
});

module.exports = router;