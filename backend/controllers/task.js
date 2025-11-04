import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";

const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, status, priority, dueDate, assignees } =
            req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const workspace = await Workspace.findById(project.workspace);

        if (!workspace) {
            return res.status(404).json({
                message: "Espace de travail non trouvé",
            });
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de cet espace de travail",
            });
        }

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
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId)
            .populate("assignees", "name profilePicture")
            .populate("watchers", "name profilePicture");

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project).populate(
            "members.user",
            "name profilePicture"
        );

        res.status(200).json({ task, project });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const updateTaskTitle = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const oldTitle = task.title;

        task.title = title;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `titre de la tâche mise à jour de ${oldTitle} à ${title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};
const updateTaskDescription = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { description } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const oldDescription =
            task.description.substring(0, 50) +
            (task.description.length > 50 ? "..." : "");
        const newDescription =
            description.substring(0, 50) + (description.length > 50 ? "..." : "");

        task.description = description;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `description de la tâche mise à jour de ${oldDescription} à ${newDescription}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const oldStatus = task.status;

        task.status = status;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `statut de la tâche mise à jour de ${oldStatus} à ${status}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};
const updateTaskAssignees = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assignees } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const oldAssignees = task.assignees;

        task.assignees = assignees;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `les assignés de la tâche ont été modifiés de ${oldAssignees.length} à ${assignees.length}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};
const updateTaskPriority = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { priority } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const oldPriority = task.priority;

        task.priority = priority;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `priorité des tâches mise à jour de ${oldPriority} à ${priority}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const addSubTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const newSubTask = {
            title,
            completed: false,
        };

        task.subtasks.push(newSubTask);
        await task.save();

        // record activity
        await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
            description: `sous-tâche crée ${title}`,
        });

        res.status(201).json(task);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const updateSubTask = async (req, res) => {
    try {
        const { taskId, subTaskId } = req.params;
        const { completed } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const subTask = task.subtasks.find(
            (subTask) => subTask._id.toString() === subTaskId
        );

        if (!subTask) {
            return res.status(404).json({
                message: "Sous-tâche non trouvée",
            });
        }

        subTask.completed = completed;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
            description: `sous-tâche mise à jour ${subTask.title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const getActivityByResourceId = async (req, res) => {
    try {
        const { resourceId } = req.params;

        const activity = await ActivityLog.find({ resourceId })
            .populate("user", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(activity);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const getCommentsByTaskId = async (req, res) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.find({ task: taskId })
            .populate("author", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const newComment = await Comment.create({
            text,
            task: taskId,
            author: req.user._id,
        });

        task.comments.push(newComment._id);
        await task.save();

        // record activity
        await recordActivity(req.user._id, "added_comment", "Task", taskId, {
            description: `commentaire ajouté ${text.substring(0, 50) + (text.length > 50 ? "..." : "")
                }`,
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const watchTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const isWatching = task.watchers.includes(req.user._id);

        if (!isWatching) {
            task.watchers.push(req.user._id);
        } else {
            task.watchers = task.watchers.filter(
                (watcher) => watcher.toString() !== req.user._id.toString()
            );
        }

        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isWatching ? "a arrêté de suivre" : "a commencé à suivre"
                } task ${task.title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const achievedTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Tâche non trouvée",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }
        const isAchieved = task.isArchived;

        task.isArchived = !isAchieved;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isAchieved ? "marqué comme non terminée" : "marqué comme terminée"} task ${task.title
                }`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
            .populate("project", "title workspace")
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

// controllers/task.js (ajoute ceci)
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

};
