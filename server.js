const app = require('./app');
const db = require('./models');
const bcrypt = require('bcrypt');
const { Admin } = db; // récupère directement depuis db
require('dotenv').config();


const PORT = process.env.PORT || 3030;

// Fonction pour créer l'admin par défaut si inexistant
async function createDefaultAdmin() {
    try {
        const existingAdmin = await Admin.findOne({ where: { email: 'admin@rider.com' } });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin1234', 10);
            await Admin.create({
                email: 'admin@rider.com',
                motDePasse: hashedPassword,
                identifiant: 'ADMIN-RIDER',
                role: 'admin',
            });
            console.log('✅ Admin par défaut créé avec succès.');
        } else {
            console.log('ℹ️ Admin par défaut déjà présent.');
        }
    } catch (err) {
        console.error('❌ Erreur lors de la création de l’admin par défaut :', err);
    }
}



// Connexion à la base + lancement du serveur
db.sequelize.sync()
    .then(() => {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        console.log('✅ Connexion à la base de données réussie.');
        return createDefaultAdmin();
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Échec du démarrage du serveur :', err);
    });