import Workspace from "../models/workspace.js";

export const resolveWorkspaceRole = async (req, res, next) => {
    try {
        const workspaceId =
            req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

        if (!workspaceId) {
            req.workspace = null;
            req.workspaceRole = null;
            return next();
        }

        const workspace = await Workspace.findById(workspaceId).populate(
            "members.user",
            "name email"
        );

        if (!workspace) {
            return res.status(404).json({ message: "Espace de travail non trouvé" });
        }

        req.workspace = workspace;

        const member = workspace.members.find(
            (m) => m.user._id.toString() === req.user._id.toString()
        );

        req.workspaceRole = member ? member.role : null;

        next();
    } catch (error) {
        console.error("Erreur dans resolveWorkspaceRole:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
