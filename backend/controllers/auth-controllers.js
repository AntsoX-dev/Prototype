import { sendEmail } from "../libs/send-email.js";
import Utilisateur from "../models/user.js";
import Verification from "../models/verification.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Arcjet from "@arcjet/node";

// Initialisation Arcjet (si en production)
let aj;
if (process.env.ARCJET_ENV === "production") {
  aj = Arcjet({
    key: process.env.ARCJET_KEY,
    environment: process.env.ARCJET_ENV,
  });
}

// REGISTER
export const registerUtilisateur = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (process.env.ARCJET_ENV === "production" && aj) {
      const decision = await aj.protect(req, { email });
      if (decision.isDenied()) {
        return res.status(403).json({ message: "Adresse e-mail invalide" });
      }
    } else {
      console.log("Arcjet désactivé (mode développement)");
    }

    const existingUtilisateur = await Utilisateur.findOne({ email });
    if (existingUtilisateur) {
      return res.status(400).json({ message: "Adresse existe déjà !" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUtilisateur = await Utilisateur.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    const verificationToken = jwt.sign(
      { userId: newUtilisateur._id, purpose: "email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: newUtilisateur._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `
      <p>Bonjour ${name},</p>
      <p>Merci de vous être inscrit sur Planifio.</p>
      <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre e-mail :</p>
      <p><a href="${verificationLink}">Vérifier mon e-mail</a></p>
      <p>Ce lien expire dans 1 heure.</p>
    `;

    const isEmailSent = await sendEmail(email, "Vérification de votre e-mail", emailBody);
    if (!isEmailSent) {
      return res.status(500).json({ message: "Échec de l'envoi de l'e-mail de vérification" });
    }

    res.status(201).json({
      message: "Un e-mail de vérification vous a été envoyé. Veuillez vérifier votre boîte mail.",
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

//LOGIN 
export const loginUtilisateur = async (req, res) => {
  try {
    const { email, password } = req.body;

    const utilisateur = await Utilisateur.findOne({ email }).select("+password");

    if (!utilisateur) {
      return res.status(400).json({ message: "E-mail ou mot de passe invalide" });
    }

    if (!utilisateur.isEmailVerified) {
      return res.status(400).json({
        message: "E-mail non vérifié. Veuillez vérifier votre boîte mail.",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, utilisateur.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "E-mail ou mot de passe invalide" });
    }

    const token = jwt.sign(
      { userId: utilisateur._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    utilisateur.dernier_login = new Date();
    await utilisateur.save();

    const userData = utilisateur.toObject();
    delete userData.password;

    res.status(200).json({
      message: "Connexion réussie",
      token,
      utilisateur: userData,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

//VERIFY EMAIL
// backend/controllers/auth-controllers.js (remplace la fonction existante)
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }

    // 1) Cherche la vérification par token (plus sûr si le token a été stocké)
    const verification = await Verification.findOne({ token });
    if (!verification) {
      console.log("verifyEmail: verification not found for token");
      return res.status(401).json({ message: "Token invalide ou déjà utilisé" });
    }

    // 2) Vérifier expiration
    if (verification.expiresAt < new Date()) {
      console.log("verifyEmail: token expired for token", token);
      await Verification.findByIdAndDelete(verification._id).catch(() => {});
      return res.status(401).json({ message: "Lien expiré, veuillez vous réinscrire." });
    }

    // 3) Vérifier JWT (sécurité supplémentaire)
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("verifyEmail: jwt.verify failed", err.message);
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    const userIdFromToken = payload.userId;
    // 4) Vérifier que userId du token correspond à verification.userId
    if (String(verification.userId) !== String(userIdFromToken)) {
      console.log("verifyEmail: userId mismatch", verification.userId, userIdFromToken);
      return res.status(401).json({ message: "Token non autorisé (mismatch user)" });
    }

    // 5) Trouver et mettre à jour l'utilisateur (champ isEmailVerified)
    const utilisateur = await Utilisateur.findById(userIdFromToken);
    if (!utilisateur) {
      console.log("verifyEmail: utilisateur introuvable", userIdFromToken);
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (utilisateur.isEmailVerified) {
      // supprimer la verification si elle existait encore
      await Verification.findByIdAndDelete(verification._id).catch(() => {});
      return res.status(200).json({ message: "E-mail déjà vérifié" });
    }

    utilisateur.isEmailVerified = true;
    await utilisateur.save();

    // suppression du token dans la collection verification
    await Verification.findByIdAndDelete(verification._id).catch(() => {});

    console.log("verifyEmail: success for user", utilisateur._id);
    return res.status(200).json({ message: "E-mail vérifié avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'e-mail :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};


//FORGOT PASSWORD
export const forgotPasswordUtilisateur = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email manquant" });
    }

    const utilisateur = await Utilisateur.findOne({ email });

    // Pour ne pas divulguer si l'email existe, on renvoie toujours le même message.
    if (!utilisateur) {
      return res.status(200).json({
        message: "Si cet e-mail existe, un lien de réinitialisation a été envoyé.",
      });
    }

    // Générer token de réinitialisation
    const resetToken = jwt.sign(
      { userId: utilisateur._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: utilisateur._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailBody = `
      <p>Bonjour ${utilisateur.name || ""},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
      <p><a href="${resetLink}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si vous n'avez pas demandé de réinitialisation, ignorez ce message.</p>
    `;

    const isEmailSent = await sendEmail(email, "Réinitialisation du mot de passe", emailBody);
    if (!isEmailSent) {
      return res.status(500).json({ message: "Échec de l'envoi de l'e-mail de réinitialisation" });
    }

    return res.status(200).json({
      message: "Si cet e-mail existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Erreur forgotPassword :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

//  RESET PASSWORD
export const resetPasswordUtilisateur = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token ou nouveau mot de passe manquant" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    if (payload.purpose !== "password-reset") {
      return res.status(401).json({ message: "Token non autorisé" });
    }

    const verification = await Verification.findOne({ userId: payload.userId, token });
    if (!verification) {
      return res.status(401).json({ message: "Token invalide ou déjà utilisé" });
    }

    if (verification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(verification._id);
      return res.status(401).json({ message: "Lien expiré" });
    }

    const utilisateur = await Utilisateur.findById(payload.userId).select("+password");
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const salt = await bcryptjs.genSalt(10);
    utilisateur.password = await bcryptjs.hash(newPassword, salt);
    await utilisateur.save();

    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur resetPassword :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
