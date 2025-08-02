const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models'); // adapte le chemin selon ta config

router.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ message: "Email et mot de passe sont requis." });
  }

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ message: "Email invalide." });
    }

    
    const passwordMatch = await bcrypt.compare(motDePasse, admin.motDePasse);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, admin });
  } catch (err) {
    console.error("Erreur lors de la connexion admin:", err);
    res.status(500).json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
  }
});

module.exports = router;
