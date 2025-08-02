const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chemin absolu vers le dossier uploads
const uploadDir = path.join(__dirname, '..', 'uploads');

// Crée le dossier uploads s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});


// Filtrage des fichiers acceptés
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedExt = /\.(jpeg|jpg|png|gif)$/i;
        if (allowedExt.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images au format jpeg, jpg, png, gif sont autorisées'));
        }
    }
});

module.exports = upload;