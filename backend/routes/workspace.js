import express from "express";
import { validateRequest } from "zod-express-middleware"
import { workspaceSchema } from "../libs/validate_schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { acceptGenerateInvite, acceptInviteByToken, createWorkspace, inviteUserToWorkspace } from "../controllers/workspace.js";
import { getWorkspaces } from "../controllers/workspace.js";
import { getWorkspaceDetails } from "../controllers/workspace.js";
import { getWorkspaceProjects } from "../controllers/workspace.js";
import { getWorkspaceStats } from "../controllers/workspace.js";
import { inviteMemberSchema, tokenSchema } from "../libs/validate_schema.js";
import { z } from "zod";


const router = express.Router();
router.post("/",
    authMiddleware,
    validateRequest({ body: workspaceSchema }),
    createWorkspace
);

router.post(
    "/accept-invite-token",
    authMiddleware,
    validateRequest({ body: tokenSchema }),
    acceptInviteByToken
);

router.post(
    "/:workspaceId/invite-member",
    authMiddleware,
    validateRequest({
        params: z.object({ workspaceId: z.string() }),
        body: inviteMemberSchema,
    }),
    inviteUserToWorkspace
);

router.post(
    "/:workspaceId/accept-generate-invite",
    authMiddleware,
    validateRequest({ params: z.object({ workspaceId: z.string() }) }),
    acceptGenerateInvite
);

router.get("/", authMiddleware, getWorkspaces);

router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

export default router;