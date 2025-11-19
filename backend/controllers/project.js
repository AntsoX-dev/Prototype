import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

/* ============================================================
   🔹 UTILITAIRES DE VÉRIFICATION DES ROLES
   ============================================================ */
function getWorkspaceRole(workspace, userId) {
  if (workspace.owner.toString() === userId.toString()) return "owner";
  const member = workspace.members.find((m) => m.user._id?.toString() === userId.toString() || m.user.toString() === userId.toString());
  return member ? member.role : null;
}

function getProjectRole(project, userId) {
  const member = project.members.find((m) =>
    (m.user._id?.toString() || m.user.toString()) === userId.toString()
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



function getEffectiveProjectRole(workspaceRole, projectRole) {
  if (["owner", "admin"].includes(workspaceRole)) return "manager";
  return projectRole;
}



/**
 * Vérifie si l'utilisateur peut gérer (modifier/supprimer) un projet
 */
function canManageProject(workspace, project, userId) {
  const wsRole = getWorkspaceRole(workspace, userId);
  const projectRole = getProjectRole(project, userId);

  const effectiveRole = getEffectiveProjectRole(wsRole, projectRole);

  return effectiveRole === "manager";
}

/**
 * Vérifie si l'utilisateur peut voir le projet
 */
function canViewProject(workspace, project, userId) {
    const wsRole = getWorkspaceRole(workspace, userId);
    const projectRole = getProjectRole(project, userId);

    // autorisé si membre du workspace ou membre du projet
    return ["owner", "admin", "member", "viewer"].includes(wsRole) || projectRole !== null;
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

// const getProjectDetails = async (req, res) => {
//     try {
//         const { projectId } = req.params;

//         const project = await Project.findById(projectId)
//             .populate("members.user", "name profil")
//             .populate("workspace", "name members");

//         if (!project)
//             return res.status(404).json({ message: "Projet non trouvé" });

//         const workspace = await Workspace.findById(project.workspace);

//         if (!canViewProject(workspace, project, req.user._id))
//             return res.status(403).json({
//                 message: "Vous n'avez pas accès à ce projet.",
//             });

//         res.status(200).json(project);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Erreur interne du serveur" });
//     }
// };
const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("members.user", "_id name email")
      .populate("createdBy", "_id name email")
      .populate({
        path: "workspace",
        populate: { path: "members.user", select: "_id name email" }
      });

    if (!project)
      return res.status(404).json({ message: "Projet non trouvé" });

    const workspace = project.workspace;
    const userId = req.user._id.toString();

    const wsRole = getWorkspaceRole(workspace, userId);
    const projectRole = getProjectRole(project, userId);

    const canAccess =
      ["owner", "admin"].includes(wsRole) ||
      projectRole !== null ||
      project.createdBy._id.toString() === userId;

    if (!canAccess) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce projet." });
    }

    return res.status(200).json({
      project,
      workspace
    });
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
            // .populate("workspace");

            .populate({
                path: "workspace",
                populate: {
                    path: "members.user",
                    select: "name profil"
                }
            });


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


/*
 Parametre de projet
*/
/* === UPDATE PROJECT === */
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const project = await Project.findById(projectId)
      .populate("members.user", "name email profil")
      .populate("createdBy", "name email profil")
      .populate("workspace");

    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    const workspace = project.workspace;
    const userId = req.user._id.toString();

    // 🔹 Récupérer les rôles directement
    const wsRole = getWorkspaceRole(workspace, userId);
    const projectRole = getProjectRole(project, userId);
    const isCreator = project.createdBy._id.toString() === userId;

    // 🔒 Vérification permission générale
    const canEditGeneral = isCreator || projectRole === "manager" || ["owner", "admin"].includes(wsRole);
    if (!canEditGeneral)
      return res.status(403).json({ message: "Vous n'avez pas les droits pour modifier ce projet." });

    // 🔒 Vérification modification des membres
    if (updates.members !== undefined) {
      if (!Array.isArray(updates.members))
        return res.status(400).json({ message: "Le champ 'members' doit être un tableau." });

      // Assurer que le créateur reste membre avec rôle manager
      const updatedMembers = [...updates.members];
      if (!updatedMembers.find(m => m.user.toString() === project.createdBy._id.toString()))
        updatedMembers.push({ user: project.createdBy._id, role: "manager" });

      project.members = updatedMembers;
    }

    // Mise à jour champs autorisés
    const allowedFields = ["title", "description", "status", "startDate", "dueDate", "tags"];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if ((field === "startDate" || field === "dueDate") && updates[field])
          project[field] = new Date(updates[field]);
        else if (field === "tags" && Array.isArray(updates[field]))
          project[field] = updates[field];
        else
          project[field] = updates[field];
      }
    });

    // Validation dates
    if (project.startDate && project.dueDate && project.startDate > project.dueDate)
      return res.status(400).json({ message: "La date de début ne peut pas être après la date de fin." });

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("members.user", "name email profil")
      .populate("createdBy", "name email profil")
      .populate("workspace", "name members");

    return res.status(200).json({
      message: "Projet mis à jour avec succès",
      project: updatedProject,
      currentUserRole: { workspaceRole: wsRole, projectRole, isCreator }
    });

  } catch (error) {
    console.error("Erreur updateProject:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du projet" });
  }
};




/* === DELETE PROJECT === */
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("members.user", "name email profil")
      .populate("workspace");
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    // On charge workspace members pour vérifier le rôle dans workspace si besoin
    const workspace = await Workspace.findById(project.workspace).populate("members.user", "name email profil");

    const userId = req.user._id.toString();

    const wsMember = workspace.members.find((m) => m.user.toString() === userId);
    const wsRole = wsMember ? wsMember.role : null;


    const projectMember = project.members.find((m) =>
    m.user._id.toString() === userId
    );
    const projectRole = projectMember ? projectMember.role : null;

    const canDelete =
    ["owner", "admin"].includes(wsRole) ||
    projectRole === "manager" ||
    project.createdBy.toString() === userId;

    if (!canDelete) {
    return res.status(403).json({ message: "Vous n’avez pas la permission de supprimer ce projet." });
    }

    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({ message: "Projet supprimé avec succès." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};


export const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id; // récupéré depuis JWT

  try {
    const project = await Project.findById(projectId)
Project.findById(projectId)
  .populate("members.user") // membres du projet
  .populate({
    path: "workspace",
    populate: { path: "members.user" }, // membres du workspace
  })
  .exec();


    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    // Récupération du rôle dans le projet
    const projectMember = project.members.find(
      (m) => m.user._id.toString() === userId.toString()
    );
    const projectRole = projectMember?.role || null;

    // Récupération du rôle dans le workspace
    const workspace = await Workspace.findById(project.workspace)
      .populate("members.user", "name email");
    const workspaceMember = workspace.members.find(
      (m) => m.user._id.toString() === userId.toString()
    );
    const workspaceRole = workspaceMember?.role || null;

    // Vérification si c’est le créateur
    const isCreator = project.createdBy.toString() === userId.toString();

    // Rôle effectif
    const effectiveRole =
      ["owner", "admin"].includes(workspaceRole) ? "manager" : projectRole;

    res.json({
      project,
      workspace,
      roles: {
        projectRole,
        workspaceRole,
        effectiveRole,
        isCreator,
        canEdit: effectiveRole === "manager" || isCreator,
        canDelete: effectiveRole === "manager" || isCreator,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export { createProject, getProjectDetails, getProjectTasks, updateProject, deleteProject, canManageProject, };