import express from "express";
import { validateRequest } from "zod-express-middleware"
import { workspaceSchema } from "../libs/validate_schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { createWorkspace } from "../controllers/workspace.js";
import { getWorkspaces } from "../controllers/workspace.js";

const router = express.Router();
router.post("/", authMiddleware,
    validateRequest({ body: workspaceSchema }),
    createWorkspace
);
router.get("/", authMiddleware, getWorkspaces);
export default router;