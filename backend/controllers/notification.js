import Notification from "../models/notification.js";
class NotificationController {
  // Méthode pour supprimer une notification
  static async deleteNotification(req, res) {
    const id = req.params.id;
    try {
      const deletedNotification = await Notification.findByIdAndDelete(id);

      if (!deletedNotification) {
        return res.status(404).json({
          message: `La notification avec l'identifiant ${id} n'existe pas.`,
        });
      }

      const message = `La notification avec l'identifiant ${id} a été supprimée avec succès.`;
      res.json({ message, data: deletedNotification });
    } catch (error) {
      if (error.name === "CastError") {
        return res
          .status(404)
          .json({ message: `L'identifiant ${id} n'est pas valide.` });
      }
      const message = `La notification avec l'identifiant ${id} n'a pas pu être supprimée. Réessayez dans quelques instants.`;
      res.status(500).json({ message, data: error });
    }
  }
  // Méthode pour récupérer toutes les notifications d'un utilisateur

  static async getUserNotifications(req, res) {
    const UtilisateurId = req.user.id;
    try {
      const notifications = await Notification.find({ UtilisateurId }).sort({
        date_reception: -1,
      });

      const message = `La liste des notifications a été récupérée avec succès.`;
      res.json({ message, data: notifications });
    } catch (error) {
      const message = `La liste des notifications n'a pas pu être récupérée. Réessayez dans quelques instants.`;
      res.status(500).json({ message, data: error });
    }
  }
  // Méthode pour vérifier si un utilisateur a au moins une notification non lue
  static async avoirNotificationNonLu(req, res) {
    const UtilisateurId = req.user.id;
    try {
      const exists = await Notification.findOne({ UtilisateurId, lu: false });
      res.json({ hasUnread: !!exists });
    } catch (error) {
      const message = `Impossible de vérifier les notifications non lues. Réessayez dans quelques instants.`;
      res.status(500).json({ message, data: error });
    }
  } // Méthode pour mettre toutes les notifications d'un utilisateur en lu
  static async toutMarquerLu(req, res) {
    const UtilisateurId = req.user.id;
    try {
      const result = await Notification.updateMany(
        { UtilisateurId },
        { $set: { lu: true } }
      );

      const updated = result.modifiedCount;
      const message = `Toutes les notifications de l'utilisateur ${UtilisateurId} ont été marquées comme lues.`;
      res.json({ message, updated });
    } catch (error) {
      console.log(error);
      const message = `Impossible de mettre toutes les notifications en lu. Réessayez dans quelques instants.`;
      res.status(500).json({ message, data: error });
    }
  } // Service addNotification

  static async addNotification(data) {
    return await Notification.create(data);
  }
}

export { NotificationController };
