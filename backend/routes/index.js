import express from "express";

import authRoutes from "./authentification.js";
import workspaceRoutes from "./workspace.js";

const router = express.Router();

router.use("/authentification", authRoutes);
router.use("/workspaces", workspaceRoutes);

export default router;
