import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import Utilisateur from "../models/user.js";
import { recordActivity } from "../libs/index.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
};


const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById({ _id: workspaceId, "members.user": req.user._id, }).populate("members.user",
      "name email profil");

    if (!workspace) {
      return res.status(404).json({ message: "Espace de travail non trouvé" });
    }

    res.status(200).json(workspace);
  } catch (error) {

  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": req.user._id, }).populate("members.user",
      "name email profil");
    if (!workspace) {
      return res.status(404).json({ message: "Espace de travail non trouvé" });
    }
    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      //members: {$in: [req.user._id]},
    })
      //.populate("tasks", "status")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
}

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Espace de travail non trouvé" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: "Vous n'êtes pas membre de cet espace de travail",
      });
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority createdAt"
        )
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce(
      (acc, project) => acc + project.tasks.length,
      0
    );

    const totalProjectInProgress = projects.filter(
      (p) => p.status === "In Progress"
    ).length;

    const totalTaskCompleted = projects.reduce(
      (acc, p) => acc + p.tasks.filter((t) => t.status === "Done").length,
      0
    );
    const totalTaskToDo = projects.reduce(
      (acc, p) => acc + p.tasks.filter((t) => t.status === "To Do").length,
      0
    );
    const totalTaskInProgress = projects.reduce(
      (acc, p) => acc + p.tasks.filter((t) => t.status === "In Progress").length,
      0
    );

    const tasks = projects.flatMap((p) => p.tasks);

    // 📅 --- Génération dynamique des tendances de la semaine ---
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const taskTrendsData = days.map((day) => ({
      name: day,
      completed: 0,
      inProgress: 0,
      toDo: 0,
    }));

    for (const task of tasks) {
      // on prend les tâches créées ou modifiées cette semaine
      const date = new Date(task.updatedAt || task.createdAt);
      if (date >= startOfWeek) {
        const dayIndex = date.getDay();
        const trend = taskTrendsData[dayIndex];

        switch (task.status) {
          case "Done":
            trend.completed++;
            break;
          case "In Progress":
            trend.inProgress++;
            break;
          default:
            trend.toDo++;
            break;
        }
      }
    }

    // 📊 --- Distribution des statuts des projets ---
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];
    for (const p of projects) {
      switch (p.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // 🎯 --- Priorité des tâches ---
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];
    for (const t of tasks) {
      switch (t.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    // 🧩 --- Productivité des projets ---
    const workspaceProductivityData = projects.map((project) => {
      const projectTasks = tasks.filter(
        (t) => t.project.toString() === project._id.toString()
      );
      const completedTasks = projectTasks.filter(
        (t) => t.status === "Done" && !t.isArchived
      );
      return {
        name: project.title,
        completed: completedTasks.length,
        total: projectTasks.length,
      };
    });

    // 🕒 --- Tâches à venir dans 7 jours ---
    const upcomingTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      const today = new Date();
      return (
        due > today && due <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    // 📈 --- Statistiques globales ---
    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Espace de travail non trouvé",
      });
    }

    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à inviter des membres dans cet espace de travail",
      });
    }

    const existingUser = await Utilisateur.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        message: "Utilisateur non trouvé",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "L'utilisateur est déjà membre de cet espace de travail",
      });
    }

    const isInvited = await WorkspaceInvite.findOne({
      user: existingUser._id,
      workspaceId: workspaceId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "Utilisateur déjà invité dans cet espace de travail",
      });
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await WorkspaceInvite.deleteOne({ _id: isInvited._id });
    }

    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        workspaceId: workspaceId,
        role: role || "membre",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await WorkspaceInvite.create({
      user: existingUser._id,
      workspaceId: workspaceId,
      token: inviteToken,
      role: role || "membre",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

    const emailContent = `
      <p>Vous avez été invité à rejoindre l'espace de travail ${workspace.name}</p>
      <p>Cliquez ici pour rejoindre : <a href="${invitationLink}">${invitationLink}</a></p>
    `;

    await sendEmail(
      email,
      "Vous avez été invité à rejoindre un espace de travail",
      emailContent
    );

    res.status(200).json({
      message: "Invitation envoyée avec succès",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
};


const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Espace de travail non trouvé",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "Vous êtes déjà membre de cet espace de travail",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "membre",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordActivity(
      req.user._id,
      "a rejoint_l'espace_de_travail",
      "Espace de travail",
      workspaceId,
      {
        description: `A rejoint l'espace de travail ${workspace.name}`,
      }
    );

    res.status(200).json({
      message: "Invitation acceptée avec succès",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Espace de travail non trouvé",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "L'utilisateur est déjà membre de cet espace de travail",
      });
    }

    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation non trouvée",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "L'invitation a expiré",
      });
    }

    workspace.members.push({
      user: user,
      role: role || "membre",
      joinedAt: new Date(),
    });

    await workspace.save();

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(user, "a rejoint_l'espace_de_travail", "Espace de travail", workspaceId, {
        description: `A rejoint l'espace de travail ${workspace.name}`,
      }),
    ]);

    res.status(200).json({
      message: "Invitation acceptée avec succès",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
};


//SETTINGS

export const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Espace introuvable" });

    if (String(workspace.owner) !== String(req.user._id))
      return res.status(403).json({ message: "Non autorisé à modifier cet espace." });

    workspace.name = name ?? workspace.name;
    workspace.description = description ?? workspace.description;
    workspace.color = color ?? workspace.color;

    await workspace.save();
    res.status(200).json({ message: "Espace mis à jour avec succès", workspace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du workspace" });
  }
};



export const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Espace introuvable" });

    if (String(workspace.owner) !== String(req.user._id))
      return res.status(403).json({ message: "Non autorisé à supprimer cet espace." });

    await Workspace.findByIdAndDelete(workspaceId);

    res.status(200).json({ message: "Espace supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du workspace" });
  }
};




export const transferWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { newOwnerId } = req.body;

    const workspace = await Workspace.findById(workspaceId).populate("members.user");
    if (!workspace) return res.status(404).json({ message: "Espace introuvable" });

    if (String(workspace.owner) !== String(req.user._id))
      return res.status(403).json({ message: "Non autorisé à transférer cet espace." });

    const member = workspace.members.find(
      (m) => String(m.user._id) === String(newOwnerId)
    );
    if (!member) return res.status(400).json({ message: "L'utilisateur n'est pas membre" });

    // Effectuer le transfert
    workspace.owner = newOwnerId;
    workspace.members = workspace.members.map((m) => {
      if (String(m.user._id) === String(newOwnerId))
        return { ...m.toObject(), role: "owner" };
      if (String(m.user._id) === String(req.user._id))
        return { ...m.toObject(), role: "admin" };
      return m;
    });

    await workspace.save();
    res.status(200).json({ message: "Transfert effectué avec succès", workspace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du transfert du workspace" });
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
};
