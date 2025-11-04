import Utilisateur from "../models/user.js";
import bcrypt from "bcryptjs";

const getUserProfile = async (req, res) => {
    try {
        const user = await Utilisateur.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        delete user.password;

        // jfkd

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur :", error);

        res.status(500).json({ message: "Erreur serveur" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, profilePicture } = req.body;

        const user = await Utilisateur.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        user.name = name;

        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil utilisateur :", error);

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
                .json({ message: "Le nouveau mot de passe et la confirmation ne correspondent pas" });
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
