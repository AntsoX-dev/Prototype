const multer = require("multer");

// 1. Utiliser memoryStorage pour stocker le fichier temporairement en RAM (Buffer)
const storage = multer.memoryStorage();

// 2. Filtre mis à jour pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    // Retourne un message d'erreur clair
    cb(
      new Error(
        "Format de fichier non supporté. Veuillez utiliser une image (PNG, JPG)."
      ),
      false
    );
  }
};

// 3. Configuration finale : 5MB max et un seul fichier nommé 'photo'
const uploadPhoto = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max
  fileFilter: fileFilter,
}).single("photo");

module.exports = uploadPhoto;
