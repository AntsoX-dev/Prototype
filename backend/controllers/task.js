import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import { uploadFileToCloudinary } from "../libs/cloudinary.js";

/* ================================
   🔹 Helpers de gestion de rôles 🔹
   ================================ */

const isProjectMember = (project, userId) =>
    project.members.some((m) => m.user.toString() === userId.toString());

const isWorkspaceMember = (workspace, userId) =>
    workspace.members.some((m) => m.user.toString() === userId.toString());

const getProjectRole = (project, userId) => {
    const m = project.members.find((m) => m.user.toString() === userId.toString());
    return m ? m.role : null;
};

const getWorkspaceRole = (workspace, userId) => {
    const m = workspace.members.find((m) => m.user.toString() === userId.toString());
    return m ? m.role : null;
};

// Autorisation de gestion des tâches (création, update, suppression)
const canManageTask = (workspace, project, userId) => {
    const projectRole = getProjectRole(project, userId);
    const workspaceRole = getWorkspaceRole(workspace, userId);

    if (["owner", "admin"].includes(workspaceRole)) return true;
    if (["manager", "contributor"].includes(projectRole)) return true;

    return false;
};

/* =============================
   🔸 TES CONTROLLERS COMPLETS 🔸
   ============================= */

const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, status, priority, dueDate, assignees } = req.body;

        const project = await Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: "Projet non trouvé" });

        const workspace = await Workspace.findById(project.workspace);
        if (!workspace)
            return res.status(404).json({ message: "Espace de travail non trouvé" });

        const isMember = isWorkspaceMember(workspace, req.user._id);
        if (!isMember)
            return res.status(403).json({ message: "Vous n'êtes pas membre de cet espace de travail" });

        // 🔒 Vérifie si l'utilisateur peut créer
        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Vous n'avez pas les droits pour créer une tâche." });

        const newTask = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            assignees,
            project: projectId,
            createdBy: req.user._id,
        });

        project.tasks.push(newTask._id);
        await project.save();

        res.status(201).json(newTask);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId)
            .populate("assignees", "name profil")
            .populate("watchers", "name profil");

        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project)
            .populate("members.user", "name profil")
            .populate({
                path: "workspace",
                populate: {
                    path: "members.user",
                    select: "name profil"
                }
            });

        const workspace = project.workspace;

        const isAssigned = task.assignees.some(a => a._id.toString() === req.user._id.toString());

        // ✅ Autoriser si workspace membre, projet membre ou assigneé à la tâche
        if (!isWorkspaceMember(workspace, req.user._id) &&
            !isProjectMember(project, req.user._id) &&
            !isAssigned)
            return res.status(403).json({ message: "Accès refusé à cette tâche." });

        res.status(200).json({ task, project });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};



const updateTaskTitle = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const oldTitle = task.title;
        task.title = title;
        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `titre de la tâche mis à jour de ${oldTitle} à ${title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const updateTaskDescription = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { description } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const oldDescription =
            task.description.substring(0, 50) + (task.description.length > 50 ? "..." : "");
        const newDescription =
            description.substring(0, 50) + (description.length > 50 ? "..." : "");

        task.description = description;
        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `description mise à jour de ${oldDescription} à ${newDescription}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const oldStatus = task.status;
        task.status = status;
        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `statut mis à jour de ${oldStatus} à ${status}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const updateTaskAssignees = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assignees } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const oldAssignees = task.assignees;
        task.assignees = assignees;
        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `assignés modifiés (${oldAssignees.length} → ${assignees.length})`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const updateTaskPriority = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { priority } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const oldPriority = task.priority;
        task.priority = priority;
        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `priorité mise à jour de ${oldPriority} à ${priority}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const addSubTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const newSubTask = { title, completed: false };
        task.subtasks.push(newSubTask);
        await task.save();

        await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
            description: `sous-tâche créée ${title}`,
        });

        res.status(201).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// ⬇️ (toutes les autres fonctions restent inchangées mais gardent le contrôle d’accès)
const updateSubTask = async (req, res) => {
    try {
        const { taskId, subTaskId } = req.params;
        const { completed } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const subTask = task.subtasks.find(
            (subTask) => subTask._id.toString() === subTaskId
        );
        if (!subTask)
            return res.status(404).json({ message: "Sous-tâche non trouvée" });

        subTask.completed = completed;
        await task.save();

        await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
            description: `sous-tâche mise à jour ${subTask.title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const getActivityByResourceId = async (req, res) => {
    try {
        const { resourceId } = req.params;

        const activity = await ActivityLog.find({ resourceId })
            .populate("user", "name profil")
            .sort({ createdAt: -1 });

        res.status(200).json(activity);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const getCommentsByTaskId = async (req, res) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.find({ task: taskId })
            .populate("author", "name profil")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const addComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text } = req.body;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        // 💬 Même les "viewers" peuvent commenter, donc juste vérifier la présence
        const isMember =
            isProjectMember(project, req.user._id) ||
            isWorkspaceMember(workspace, req.user._id);
        if (!isMember)
            return res.status(403).json({ message: "Vous n'êtes pas membre de ce projet" });

        const newComment = await Comment.create({
            text,
            task: taskId,
            author: req.user._id,
        });

        task.comments.push(newComment._id);
        await task.save();

        await recordActivity(req.user._id, "added_comment", "Task", taskId, {
            description: `commentaire ajouté ${text.substring(0, 50) + (text.length > 50 ? "..." : "")}`,
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const watchTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (
            !isProjectMember(project, req.user._id) &&
            !isWorkspaceMember(workspace, req.user._id)
        )
            return res.status(403).json({ message: "Accès refusé à cette tâche." });

        const isWatching = task.watchers.includes(req.user._id);
        if (!isWatching) {
            task.watchers.push(req.user._id);
        } else {
            task.watchers = task.watchers.filter(
                (watcher) => watcher.toString() !== req.user._id.toString()
            );
        }

        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isWatching ? "a arrêté de suivre" : "a commencé à suivre"} la tâche ${task.title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const achievedTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tâche non trouvée" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        if (!canManageTask(workspace, project, req.user._id))
            return res.status(403).json({ message: "Action non autorisée." });

        const isAchieved = task.isArchived;
        task.isArchived = !isAchieved;
        await task.save();

        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isAchieved ? "marqué comme non terminée" : "marqué comme terminée"} la tâche ${task.title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
            .populate({
                path: "project",
                populate: {
                    path: "workspace",
                    select: "name members"
                }
            })
            .sort({ createdAt: -1 });

        // ❗ Filtrer les taches où le workspace a été supprimé
        const filteredTasks = tasks.filter(t =>
            t.project && t.project.workspace
        );

        res.status(200).json(filteredTasks);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


const getTaskTrends = async (req, res) => {
    try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const tasks = await Task.find({
            createdAt: { $gte: startOfWeek },
            isArchived: false,
        });

        const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        const trends = days.map((day) => ({
            name: day,
            completed: 0,
            inProgress: 0,
            toDo: 0,
        }));

        tasks.forEach((task) => {
            const date = new Date(task.updatedAt || task.createdAt);
            if (date >= startOfWeek) {
                const dayIndex = date.getDay();
                const entry = trends[dayIndex];
                switch (task.status) {
                    case "Done":
                        entry.completed++;
                        break;
                    case "In Progress":
                        entry.inProgress++;
                        break;
                    default:
                        entry.toDo++;
                        break;
                }
            }
        });

        res.status(200).json(trends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};
const addAttachmentToTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { customName } = req.body;
        const file = req.file;

        if (!file) {
            return res
                .status(400)
                .json({ message: "Aucun fichier n'a été uploadé." });
        }

        if (!customName) {
            return res
                .status(400)
                .json({ message: "Le nom personnalisé est requis." });
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res
                .status(403)
                .json({ message: "Vous n'êtes pas membre de ce projet" });
        }

        const uploadResult = await uploadFileToCloudinary(
            file.buffer,
            "task-attachments"
        );

        const newAttachment = {
            fileName: customName,
            fileUrl: uploadResult.secure_url,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: req.user._id,
        };

        task.attachments.push(newAttachment);
        await task.save();

        await recordActivity(req.user._id, "added_attachment", "Task", taskId, {
            description: `a ajouté la pièce jointe : ${customName}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        if (error?.message?.includes("Format non supporté")) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const addLinkToTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { customName, fileUrl } = req.body;

        if (!customName || !fileUrl) {
            return res
                .status(400)
                .json({ message: "Le nom personnalisé et l'URL sont requis." });
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res
                .status(403)
                .json({ message: "Vous n'êtes pas membre de ce projet" });
        }

        const newAttachment = {
            fileName: customName,
            fileUrl: fileUrl,
            fileType: "link/url",
            fileSize: 0,
            uploadedBy: req.user._id,
        };

        task.attachments.push(newAttachment);
        await task.save();

        await recordActivity(req.user._id, "added_attachment", "Task", taskId, {
            description: `a ajouté le lien : ${customName}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


// suppression d'une tache 
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) return res.status(404).json({ message: "Workspace non trouvé" });

    //  Vérifier le rôle dans le workspace
    const userRole = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    )?.role;

    // Même logique que le FRONT
    const canDelete = userRole === "admin" || userRole === "owner";

    if (!canDelete) {
      return res.status(403).json({
        message: "Vous n'avez pas les autorisations pour supprimer cette tâche",
      });
    }

    //  Supprimer la tâche
    await Task.findByIdAndDelete(taskId);

    project.tasks = project.tasks.filter(
      (t) => t.toString() !== taskId.toString()
    );
    await project.save();

    await recordActivity(req.user._id, "deleted_task", "Task", taskId, {
      description: `Tâche supprimée : ${task.title}`,
    });

    return res.status(200).json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};


/* 
   🔸 EXPORT FINAL DE TOUS LES FONCTIONS 🔸
 */
export {
    createTask,
    getTaskById,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    updateTaskAssignees,
    updateTaskPriority,
    addSubTask,
    updateSubTask,
    getActivityByResourceId,
    getCommentsByTaskId,
    addComment,
    watchTask,
    achievedTask,
    getMyTasks,
    getTaskTrends,
    addAttachmentToTask,
    addLinkToTask,
    deleteTask,
};
