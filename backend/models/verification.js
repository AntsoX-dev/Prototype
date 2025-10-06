import mongoose from "mongoose";
import Utilisateur from "./user.js"; 

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
