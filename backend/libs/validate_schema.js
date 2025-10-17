import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(3,"Le nom est requis"),
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

const loginSchema = z.object({
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Le jeton est requis"),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "La confirmation de mot de passe est requis"),
});

const workspaceSchema = z.object({
    name: z.string().min(1,"Le nom est requis"),
    description: z.string().optional(),
    color: z.string().min(1,"Une couleur est requis"),
});

const verifyEmailSchema = z.object({
    token: z.string().min(1, "Le jeton d'authentification est obligatoire")
});

export { registerSchema, loginSchema, verifyEmailSchema, resetPasswordSchema, workspaceSchema };
