const express = require('express');
const router = express.Router();
const { Member } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const upload = require('../middleware/upload');
const path = require('path');


/**
 * @route POST /members/add
 * @description Crée un nouveau membre avec gestion des uploads
 */


// Middleware d'upload pour les membres
const memberUpload = upload.fields([
  { name: 'photoAvatar', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]);

/**
 * @route POST /members
 * @description Crée un nouveau membre avec gestion des uploads
 */



router.post('/', memberUpload, async (req, res) => {
  try {
    const { body, files } = req;

    // Debug: Vérifiez ce que reçoit Multer
    console.log('Fichiers reçus:', {
      photoAvatar: files['photoAvatar'] ? files['photoAvatar'][0].originalname : 'Aucun',
      photos: files['photos'] ? files['photos'].map(f => f.originalname) : 'Aucune'
    });

    // Traitement identique à photoMoto
    const baseUrl = process.env.BASE_URL || 'http://localhost:3030';

    // 1. Photo avatar (comme avant)
    const photoAvatar = files['photoAvatar']?.[0]?.filename || null;

    // 2. Photos multiples - TRAITEMENT COMME photoMoto
    const memberPhotos = [];
    if (files['photos']) {
      // Transformation identique à photoMoto
      memberPhotos.push(...files['photos'].map(file => ({
        url: file.filename,
        description: '' // Même structure que photoMoto
      })));
    }

    // Debug avant création
    console.log('Données à enregistrer:', {
      photoAvatar,
      photos: memberPhotos
    });

    // Création du membre (comme pour photoMoto)
    const newMember = await Member.create({
      ...body,
      motDePasse: await bcrypt.hash(body.motDePasse, 10),
      photoAvatar,
      photos: memberPhotos, // Enregistré comme photoMoto
      role: 'membre'
    });

    // Réponse
    const { motDePasse, ...responseData } = newMember.toJSON();
    
    res.status(201).json({
      success: true,
      data: {
        ...responseData,
        photoAvatar: photoAvatar ? `${baseUrl}/uploads/${photoAvatar}` : null,
        photos: memberPhotos.map(photo => ({
          ...photo,
          url: `${baseUrl}/uploads/${photo.url}` // Même format que photoMoto
        }))
      }
    });

  } catch (error) {
    console.error('Erreur complète:', {
      message: error.message,
      stack: error.stack,
      files: req.files // Debug supplémentaire
    });

    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
router.post('/login', async (req, res) => {
    try {
      // Récupérer email et motDePasse du corps de la requête
      const { email, motDePasse } = req.body;
  
      // Vérifier que les champs sont présents
      if (!email || !motDePasse) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
      }
  
      // Chercher le membre correspondant à l'email
      const membre = await Member.findOne({ where: { email } });
      if (!membre) {
        return res.status(401).json({ message: 'Email invalide.' });
      }
  

      // Comparer le mot de passe envoyé avec le hash en base
      const isPasswordValid = await bcrypt.compare(motDePasse, membre.motDePasse);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }

  
      // Générer un token JWT valide 24h
      const token = jwt.sign(
        { id: membre.id, role: 'membre' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Répondre avec le token et les infos du membre (sans mot de passe)
      const { motDePasse: _, ...membreSansMDP } = membre.toJSON();
      res.json({ token, membre: membreSansMDP });
      
    } catch (error) {
      console.error('Erreur lors de la connexion membre:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  });
// Lire tous les membres
router.get('/', async(req, res) => {
    try {
        const members = await Member.findAll();
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route GET /members/public
 * @description Récupère la liste publique des membres avec leurs photos
 * @access Public
 */
// Récupère tous les membres (version publique)
router.get('/public', async (req, res) => {
  try {
    const members = await Member.findAll({
      attributes: ['id', 'nom', 'prenom', 'pseudo', 'ville', 'pays', 'photoAvatar', 'photos', 'club'],
      order: [['nom', 'ASC']]
    });
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupère un membre spécifique
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Membre non trouvé' });
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
  
// Lire un membre par ID
router.get('/:id', async(req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) return res.status(404).json({ message: 'Membre non trouvé' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mettre à jour un membre (avatar optionnel)
router.put('/:id', upload.single('photoAvatar'), async(req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) return res.status(404).json({ message: 'Membre non trouvé' });

        const data = req.body;
        if (req.file) data.photoAvatar = req.file.path;

        // Si motDePasse fourni, on le hash
        if (data.motDePasse) {
            const salt = await bcrypt.genSalt(10);
            data.motDePasse = await bcrypt.hash(data.motDePasse, salt);
        } else {
            delete data.motDePasse;
        }

        await member.update(data);
        res.json(member);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Supprimer un membre
router.delete('/:id', async(req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) return res.status(404).json({ message: 'Membre non trouvé' });

        await member.destroy();
        res.json({ message: 'Membre supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;