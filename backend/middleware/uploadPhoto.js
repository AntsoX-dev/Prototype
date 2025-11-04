import multer from "multer";

// 1. MemoryStorage pour stocker le fichier temporairement en RAM (Buffer)
const storage = multer.memoryStorage();

// 2. Accepter uniquement les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Format non supporté. Utilisez PNG ou JPG."), false);
  }
};

// 3. 5MB max et un seul fichier nommé 'photo'
const uploadPhoto = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max
  fileFilter,
}).single("photo");

export default uploadPhoto;
