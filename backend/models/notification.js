import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    lu: {
      type: Boolean,
      required: true,
      default: false,
    },
    UtilisateurId: {
      type: Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "date_reception",
    },
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
