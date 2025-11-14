import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import authMiddleware from "../middleware/auth-middleware.js"; 
import { NotificationController } from "../controllers/notification.js"; 

const router = express.Router();

const idParamSchema = z.object({
  id: z
    .string()
    .refine((val) => val.length > 0 && val.match(/^[0-9a-fA-F]{24}$/), {
      message: "L'ID doit être un ObjectId MongoDB valide.",
    }),
});

// 1. Récupérer toutes les notifications de l'utilisateur
router.get("/", authMiddleware, NotificationController.getUserNotifications);

// 2. Vérifier si l'utilisateur a des notifications non lues
router.get(
  "/unread/:id",
  authMiddleware,
  validateRequest({ params: idParamSchema }), 
  NotificationController.avoirNotificationNonLu
);

// 3. Marquer toutes les notifications de l'utilisateur comme lues 
router.patch(
  "/mark-all-read",
  authMiddleware,
  NotificationController.toutMarquerLu
);

// 4. Supprimer une notification par son ID 
router.delete(
  "/:id",
  authMiddleware,
  validateRequest({ params: idParamSchema }),
  NotificationController.deleteNotification
);

export default router;
