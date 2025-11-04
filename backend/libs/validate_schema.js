import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(3, "Le nom est requis"),
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

const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "member", "viewer"]),
});

const tokenSchema = z.object({
    token: z.string().min(1, "Token est Obligatoire"),
});

const workspaceSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    color: z.string().min(1, "Une couleur est requis"),
});

const verifyEmailSchema = z.object({
    token: z.string().min(1, "Le jeton d'authentification est obligatoire")
});

const projectSchema = z.object({
    title: z.string().min(3, "Le titre est obligatoire"),
    description: z.string().optional(),
    status: z.enum([
        "Planning",
        "In Progress",
        "On Hold",
        "Completed",
        "Cancelled",
    ]),
    startDate: z.string(),
    dueDate: z.string().optional(),
    tags: z.string().optional(),
    members: z
        .array(
            z.object({
                user: z.string(),
                role: z.enum(["manager", "contributor", "viewer"]),
            })
        )
        .optional(),
});
const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    status: z.enum(["To Do", "In Progress", "Done"]),
    priority: z.enum(["Low", "Medium", "High"]),
    dueDate: z.string().min(1, "Due date is required"),
    assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});

export { registerSchema, loginSchema, verifyEmailSchema, resetPasswordSchema, workspaceSchema, projectSchema, taskSchema, inviteMemberSchema, tokenSchema };
