import mongoose, { Schema } from "mongoose";

const utilisateurSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profil: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    dernier_login: { type: Date },
    statut: { type: Boolean, default: true },

    is2FAEnabled: { type: Boolean, default: false }, //authentification à deux facteurs
    twoFAOtp: { type: String, select: false }, //mot de passe à usage unique
    twoFAOtpExpires: { type: Date, select: false }, //expiration du mot de passe à usage unique
  },
  { timestamps: true } 
);

const Utilisateur = mongoose.model("Utilisateur", utilisateurSchema);

export default Utilisateur;
