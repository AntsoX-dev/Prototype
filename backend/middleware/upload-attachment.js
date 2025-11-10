import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format non supporté. Seuls les images et les PDF sont autorisés."
      ),
      false
    );
  }
};

const uploadAttachment = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB max 
  fileFilter,
}).single("file"); 

export default uploadAttachment;
