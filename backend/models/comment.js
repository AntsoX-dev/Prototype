import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    mentions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "Utilisateur",
        },
        offset: {
          type: Number,
        },
        length: {
          type: Number,
        },
      },
    ],
    reactions: [
      {
        emoji: {
          type: String,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: "Utilisateur",
        },
      },
    ],
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
      },
    ],
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
