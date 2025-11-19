import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { projectSchema } from "../libs/validate_schema.js";
import { z } from "zod";

// nouveaux middlewares
import { resolveWorkspaceRole } from "../middleware/resolveWorkspaceRole.js";
import { checkWorkspaceRole } from "../middleware/checkRole.js";

import {
    createProject,
    getProjectDetails,
    getProjectTasks,
    updateProject,
    deleteProject
} from "../controllers/project.js";

const router = express.Router();

/**
 * 📘 Créer un projet
 * Accessible uniquement aux Owner & Admin du workspace
 */
router.post(
    "/:workspaceId/create-project",
    authMiddleware,
    resolveWorkspaceRole,
    checkWorkspaceRole(["owner", "admin"]), // ✅ contrôle du rôle
    validateRequest({
        params: z.object({
            workspaceId: z.string(),
        }),
        body: projectSchema,
    }),
    createProject
);

/**
 * 📗 Récupérer les détails d’un projet
 * Accessible à tous les membres du workspace (owner, admin, member, viewer)
 */
router.get(
    "/:projectId",
    authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    getProjectDetails
);

/**
 * 📙 Récupérer les tâches du projet
 * Accessible uniquement aux membres du projet (viewer, contributor, manager)
 */
router.get(
    "/:projectId/tasks",
    authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    getProjectTasks
);

/**
 *  Modifier un projet (OWNER / MANAGER / ADMIN / OWNER workspace)
 */
router.patch(
    "/:projectId",
    authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    updateProject
);

/**
 * Supprimer un projet (OWNER / MANAGER / ADMIN / OWNER workspace)
 */
router.delete(
    "/:projectId",
    authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    deleteProject
);


router.put(
    "/:projectId",
    authMiddleware,
    validateRequest({
        params: z.object({ projectId: z.string() }),
    }),
    updateProject
);


export default router;

