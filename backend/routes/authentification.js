import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import {
  registerUtilisateur,
  loginUtilisateur,
  verifyEmail,
  forgotPasswordUtilisateur,
  resetPasswordUtilisateur,
} from "../controllers/auth-controllers.js";

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    newPassword: z.string().min(8),
  }),
});

router.post("/register", validateRequest(registerSchema), registerUtilisateur);
router.post("/login", validateRequest(loginSchema), loginUtilisateur);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPasswordUtilisateur);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPasswordUtilisateur);

export default router;
