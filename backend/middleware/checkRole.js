export const checkWorkspaceRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.workspaceRole) {
            return res.status(403).json({ message: "Accès refusé — non membre de l’espace" });
        }

        if (!allowedRoles.includes(req.workspaceRole)) {
            return res.status(403).json({
                message: "Accès refusé — rôle insuffisant pour effectuer cette action",
            });
        }

        next();
    };
};
