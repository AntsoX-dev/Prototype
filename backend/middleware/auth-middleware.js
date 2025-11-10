import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Vérification de la présence du header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Non autorisé - Token manquant ou invalide",
      });
    }

    const token = authHeader.split(" ")[1]; // extrait le token après "Bearer"

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Utilisateur non trouvé ou non autorisé",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur Auth Middleware:", error.message);
    res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
};

export default authMiddleware;
