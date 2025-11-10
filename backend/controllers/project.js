import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

/* ============================================================
   🔹 UTILITAIRES DE VÉRIFICATION DES ROLES
   ============================================================ */
function getWorkspaceRole(workspace, userId) {
    const member = workspace.members.find(
        (m) => m.user.toString() === userId.toString()
    );
    if (!member) return null;
    if (workspace.owner.toString() === userId.toString()) return "owner";
    return member.role;
}

function getProjectRole(project, userId) {
    const member = project.members.find(
        (m) => m.user.toString() === userId.toString()
    );
    return member ? member.role : null;
}

/**
 * Vérifie si l'utilisateur peut créer un projet dans le workspace
 */
function canCreateProject(workspace, userId) {
    const role = getWorkspaceRole(workspace, userId);
    return ["owner", "admin"].includes(role);
}

/**
 * Vérifie si l'utilisateur peut gérer (modifier/supprimer) un projet
 */
function canManageProject(workspace, project, userId) {
    const wsRole = getWorkspaceRole(workspace, userId);
    const projectRole = getProjectRole(project, userId);
    return (
        ["owner", "admin"].includes(wsRole) ||
        ["manager"].includes(projectRole)
    );
}

/**
 * Vérifie si l'utilisateur peut voir le projet
 */
function canViewProject(workspace, project, userId) {
    const wsRole = getWorkspaceRole(workspace, userId);
    const projectRole = getProjectRole(project, userId);
    return wsRole || projectRole;
}

/* ============================================================
   🔹 CONTROLLERS
   ============================================================ */

const createProject = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { title, description, status, startDate, dueDate, tags, members } =
            req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace)
            return res.status(404).json({ message: "Espace de travail non trouvé" });

        // 🔒 Seuls le owner et les admins peuvent créer un projet
        if (!canCreateProject(workspace, req.user._id))
            return res.status(403).json({
                message: "Vous n'avez pas les permissions pour créer un projet dans cet espace de travail.",
            });

        const tagArray = tags ? tags.split(",") : [];

        const newProject = await Project.create({
            title,
            description,
            status,
            startDate,
            dueDate,
            tags: tagArray,
            workspace: workspaceId,
            members,
            createdBy: req.user._id,
        });

        workspace.projects.push(newProject._id);
        await workspace.save();

        return res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate("members.user", "name profil")
            .populate("workspace", "name members");

        if (!project)
            return res.status(404).json({ message: "Projet non trouvé" });

        const workspace = await Workspace.findById(project.workspace);

        if (!canViewProject(workspace, project, req.user._id))
            return res.status(403).json({
                message: "Vous n'avez pas accès à ce projet.",
            });

        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate("members.user", "name profil")
            .populate("workspace");

        if (!project)
            return res.status(404).json({ message: "Projet non trouvé" });

        const workspace = await Workspace.findById(project.workspace);

        if (!canViewProject(workspace, project, req.user._id))
            return res.status(403).json({
                message: "Vous n'avez pas accès à ce projet.",
            });

        const tasks = await Task.find({
            project: projectId,
            isArchived: false,
        })
            .populate("assignees", "name profil")
            .sort({ createdAt: -1 });

        res.status(200).json({ project, tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

/* ============================================================
   🔹 EXPORT FINAL
   ============================================================ */
export { createProject, getProjectDetails, getProjectTasks };
