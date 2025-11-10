import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, trim: true },

    // 🧩 Lien vers le workspace parent
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"],
      default: "Planning",
    },

    startDate: { type: Date },
    dueDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },

    // 🔗 Liens vers les tâches
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],

    // 👥 Membres du projet avec rôles internes
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "Utilisateur",
          required: true,
        },
        role: {
          type: String,
          enum: ["manager", "contributor", "viewer"],
          default: "contributor",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // 🏷️ Tags
    tags: [{ type: String }],

    // 👤 Créateur du projet
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },

    // 📦 Statut d’archivage
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🧠 Middleware pour s'assurer que le créateur fait partie du projet
projectSchema.pre("save", async function (next) {
  if (
    this.createdBy &&
    !this.members.some((m) => m.user.toString() === this.createdBy.toString())
  ) {
    this.members.push({ user: this.createdBy, role: "manager" });
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
