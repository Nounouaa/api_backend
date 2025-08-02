const express = require('express');
const router = express.Router();
const { Club } = require('../models');
const upload = require('../middleware/upload');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// routes/clubs.js

router.post('/login', async (req, res) => {
    const { email, motDePasse } = req.body;
  
    if (!email || !motDePasse) {
      return res.status(400).json({ message: "Email et mot de passe sont requis." });
    }
  
    try {
      const club = await Club.findOne({ where: { email } });
  
      if (!club) {
        return res.status(401).json({ message: "Email invalide." });
      }
  
      const passwordMatch = await bcrypt.compare(motDePasse, club.motDePasse);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }
  
      const token = jwt.sign(
        { id: club.id, role: 'club' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      res.json({ token, club });
    } catch (err) {
      console.error("Erreur lors de la connexion club:", err);
      res.status(500).json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
    }
  });
  router.post('/add', upload.single('logoClub'), async (req, res) => {
    try {
      const data = req.body;
      const logo = req.file?.filename || null;
  
      // Conversion des nombres
      const anneeCreation = data.anneeCreation ? Number(data.anneeCreation) : null;
      const nombreMembre = data.nombreMembre ? Number(data.nombreMembre) : null; // Correction ici
  
      const clubData = {
        nomClub: data.nomClub,
        siteWeb: data.siteWeb,
        typeClub: data.typeClub === 'autre' && data.autreTypeClub ? data.autreTypeClub : data.typeClub,
        anneeCreation,
        nombreMembre, // Utilisation du bon nom de champ
        nomResponsable: data.nomResponsable,
        prenomResponsable: data.prenomResponsable,
        email: data.email,
        telephone: data.telephone,
        motDePasse: data.motDePasse,
        logoClub: logo,
      };
  
      const newClub = await Club.create(clubData);
      res.status(201).json(newClub);
      
    } catch (err) {
      console.error('Erreur:', err);
      res.status(500).json({ 
        message: 'Erreur lors de l\'ajout du club',
        error: err.message 
      });
    }
  });


  
// routes/clubs.js
router.get('/public', async (req, res) => {
  try {
    const clubs = await Club.findAll({
      attributes: [
        'id', 
        'nomClub', 
        'typeClub', 
        'nombreMembre',
        'logoClub',
        'anneeCreation'
      ],
      order: [['nomClub', 'ASC']]
    });

    // Formatage des URLs des logos
    const formattedClubs = clubs.map(club => ({
      ...club.get({ plain: true }),
      logoClub: club.logoClub ? `/uploads/${club.logoClub}` : null
    }));

    res.json(formattedClubs);
    
  } catch (error) {
    console.error('Erreur GET /public:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des clubs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🔍 Récupérer tous les clubs
router.get('/', async(req, res) => {
    try {
        const clubs = await Club.findAll();
        res.json(clubs);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des clubs.' });
    }
});

module.exports = router;