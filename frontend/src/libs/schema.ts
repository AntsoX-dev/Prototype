import { z } from "zod";

export const workspaceSchema = z.object({
    name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
    color: z.string().min(3, "La couleur doit contenir au moins 3 caractères"),
    description: z.string().optional(),
});