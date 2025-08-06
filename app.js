const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuration CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importation des routeurs
const membersRouter = require('./routes/members');
const partenaireRouter = require('./routes/partenaire');
const clubRouter = require('./routes/club');
const adminRouter = require('./routes/admin');

// Configuration des routes
app.use('/api/members', membersRouter);
app.use('/api/partenaires', partenaireRouter);
app.use('/api/clubs', clubRouter);
app.use('/api/admins', adminRouter);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;