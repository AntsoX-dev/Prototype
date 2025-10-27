import { z } from "zod";
import { ProjectStatus } from "../types";

export const workspaceSchema = z.object({
    name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
    color: z.string().min(3, "La couleur doit contenir au moins 3 caractères"),
    description: z.string().optional(),
});

export const projectSchema = z.object({
    title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
    description: z.string().optional(),
    status: z.nativeEnum(ProjectStatus),
    startDate: z.string().min(10, "La date de début est obligatoire"),
    dueDate: z.string().min(10, "La date d'échéance est obligatoire"),
    members: z.array(z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
    })
    ).optional(),
    tags: z.string().optional(),

});

export const createTaskSchema = z.object({
    title: z.string().min(1, "Le titre de la tâche est obligatoire"),
    description: z.string().optional(),
    status: z.enum(["To Do", "In Progress", "Done"]),
    priority: z.enum(["Low", "Medium", "High"]),
    dueDate: z.string().min(1, "La date d'échéance est obligatoire"),
    assignees: z.array(z.string()).min(1, "Vous devez assigner au moins une personne"),
});