import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

const createProject = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { title, description, status, startDate, dueDate, tags, members } =
            req.body;

        const workspace = await Workspace.findById(workspaceId);

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
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

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

        res.status(200).json(project);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate("members.user");

        if (!project) {
            return res.status(404).json({
                message: "Projet non trouvé",
            });
        }

        const isMember = project.members.some(
            (member) => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Vous n'êtes pas membre de ce projet",
            });
        }

        const tasks = await Task.find({
            project: projectId,
            isArchived: false,
        })
            .populate("assignees", "name profil")
            .sort({ createdAt: -1 });

        res.status(200).json({
            project,
            tasks,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
};

export { createProject, getProjectDetails, getProjectTasks };
