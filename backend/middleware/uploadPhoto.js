const multer = require("multer");

// 1. MemoryStorage pour stocker le fichier temporairement en RAM (Buffer)
const storage = multer.memoryStorage();

// 2. accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format de fichier non supporté. Veuillez utiliser une image (PNG, JPG)."
      ),
      false
    );
  }
};

// 3. 5MB max et un seul fichier nommé 'photo'
const uploadPhoto = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max
  fileFilter: fileFilter,
}).single("photo");

module.exports = uploadPhoto;
