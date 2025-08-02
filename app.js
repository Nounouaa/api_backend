const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
// Autoriser les requêtes cross-origin pour les images
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Tes routes API
app.use('/api/members', require('./routes/members'));
app.use('/api/partenaires', require('./routes/partenaire'));
app.use('/api/clubs', require('./routes/club'));
app.use('/api/admins', require('./routes/admin'));

module.exports = app;
