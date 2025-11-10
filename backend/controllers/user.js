import Utilisateur from "../models/user.js";
import bcrypt from "bcryptjs";
import { cloudinary } from "../config/cloudinary.config.js";

// --- (Fitahian) Fonction helper pour uploader le buffer vers Cloudinary ---
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "profils",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
// -----------------------------------------------------------------

// const getUserProfile = async (req, res) => {
//     try {
//         const user = await Utilisateur.findById(req.user._id).select("-password");

//         if (!user) {
//             return res.status(404).json({ message: "Utilisateur introuvable" });
//         }
//         delete user.password;

//         res.status(200).json(user);
//     } catch (error) {
//         console.error("Erreur lors de la récupération du profil utilisateur :", error);

//         res.status(500).json({ message: "Erreur serveur" });
//     }
// };

// const updateUserProfile = async (req, res) => {
//     try {
//         const { name, profilePicture } = req.body;

//         const user = await Utilisateur.findById(req.user._id);

//         if (!user) {
//             return res.status(404).json({ message: "Utilisateur introuvable" });
//         }

//         user.name = name;

//         await user.save();

//         res.status(200).json(user);
//     } catch (error) {
//         console.error("Erreur lors de la mise à jour du profil utilisateur :", error);

//         res.status(500).json({ message: "Erreur serveur" });
//     }
// };

// Fitahiana

// Fonction GET mise à jour pour mapper 'profil' vers 'profilePictureUrl'
const getUserProfile = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      created: user.createdAt,
      isEmailVerified: user.isEmailVerified,
      updated: user.updatedAt,
      profilePictureUrl: user.profil,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil utilisateur :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Fonction UPDATE mise à jour pour gérer l'upload
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    const user = await Utilisateur.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 1. Mettre à jour le nom 
    if (name) {
      user.name = name;
    }

    // 2. Gérer l'upload de l'image 
    if (file) {
      try {
        // Uploader le buffer de Multer vers Cloudinary
        const uploadResult = await uploadToCloudinary(file.buffer);

        // Enregistrer l'URL sécurisée dans le champ 'profil'
        user.profil = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Erreur d'upload Cloudinary:", uploadError);
        return res
          .status(500)
          .json({ message: "Erreur lors de l'upload de l'image" });
      }
    }

    await user.save();

    // Renvoyer la même structure que getUserProfile
    res.status(200).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      created: user.createdAt,
      isEmailVerified: user.isEmailVerified,
      updated: user.updatedAt,
      profilePictureUrl: user.profil,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du profil utilisateur :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await Utilisateur.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({
          message:
            "Le nouveau mot de passe et la confirmation ne correspondent pas",
        });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Mot de passe actuel invalide" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe :", error);

    res.status(500).json({ message: "Erreur serveur" });
  }
};

export { getUserProfile, updateUserProfile, changePassword };
