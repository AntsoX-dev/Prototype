import express from "express";

import authRoutes from "./authentification.js";

const router = express.Router();

router.use("/authentification", authRoutes);

export default router;
