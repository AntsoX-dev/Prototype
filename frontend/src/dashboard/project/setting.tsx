import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { BackButton } from "../../components/back-button";

import {
  UseProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "../../hooks/use-project";

import type { Project, Utilisateur } from "../../types";

/**
 * Helpers
 */
const getUserId = (maybeUserString: string | null) => {
  if (!maybeUserString) return null;
  try {
    const parsed = JSON.parse(maybeUserString);
    return parsed?._id ?? null;
  } catch {
    // stored value may already be an id string
    return maybeUserString;
  }
};

const getMemberUserId = (memberUser: any): string | null => {
  if (!memberUser) return null;
  if (typeof memberUser === "string") return memberUser;
  // populated user object or mongoose ObjectId-like
  if (typeof memberUser._id === "string") return memberUser._id;
  if (typeof memberUser.toString === "function") return memberUser.toString();
  return null;
};

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  /* --------------------
     Hooks (toujours en haut)
     -------------------- */
  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data?: { project: Project; workspace?: Project["workspace"] };
    isLoading: boolean;
  };

  const updateProject = useUpdateProjectMutation();
  const deleteProject = useDeleteProjectMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const storedUser = localStorage.getItem("user");
  const currentUserId = getUserId(storedUser);

  /* --------------------
     Pré-remplissage quand data arrive
     -------------------- */
  useEffect(() => {
    if (!data?.project) return;
    const p = data.project;

    setTitle(p.title ?? "");
    setDescription(p.description ?? "");

    // project.startDate / dueDate peuvent être Date ou string
setStartDate(
  p.startDate ? new Date(p.startDate).toISOString().substring(0, 10) : ""
);

setDueDate(
  p.dueDate ? new Date(p.dueDate).toISOString().substring(0, 10) : ""
);

  }, [data]);

  if (isLoading) return <p className="p-6">Chargement...</p>;
  if (!data?.project) return <p className="p-6 text-red-500">Projet introuvable</p>;

  const project = data.project;
  const workspace = data.workspace;

  
/* --------------------
   Gestion des rôles et permissions
   -------------------- */

// // 1️⃣ Récupération de l'utilisateur courant
// const storedUser = localStorage.getItem("user");
// const currentUserId = getUserId(storedUser);

// 2️⃣ Récupération membre workspace
const workspaceMember = workspace?.members?.find(
  (m: any) => getMemberUserId(m.user) === currentUserId
);
const workspaceRole: string | undefined = workspaceMember?.role;

// 3️⃣ Récupération membre projet
const projectMember = project.members?.find(
  (m: any) => getMemberUserId(m.user) === currentUserId
);
const projectRole: string | undefined = projectMember?.role;

// 4️⃣ Vérification si l'utilisateur est le créateur
const createdById =
  typeof project.createdBy === "string"
    ? project.createdBy
    : (project.createdBy as any)?._id ?? null;

const isCreator = createdById === currentUserId;

// 5️⃣ Calcul du rôle effectif
// Si l'utilisateur est owner/admin du workspace => manager
// Sinon on se base sur le rôle du projet
const effectiveProjectRole = (() => {
  if (isCreator) return "manager";
  if (workspaceRole === "owner" || workspaceRole === "admin") return "manager";
  return projectRole || "viewer"; // fallback
})();


// 6️⃣ Permissions
const canEdit = effectiveProjectRole === "manager" || isCreator;
const canDelete = effectiveProjectRole === "manager" || isCreator;

/* --------------------
   DEBUG
   -------------------- */
console.log("workspace?.members:", workspace?.members);
console.log("project?.members:", project?.members);
console.log("workspaceRole:", workspaceRole);
console.log("projectRole:", projectRole);
console.log("effectiveProjectRole:", effectiveProjectRole);
console.log("isCreator:", isCreator);


  /* --------------------
     Handlers
     -------------------- */
  const handleSave = () => {
    if (!canEdit) {
      toast.error("Vous n'avez pas les droits pour modifier ce projet.");
      return;
    }

    updateProject.mutate(
      {
        projectId: projectId!,
        payload: {
          title,
          description,
          startDate,
          dueDate,
        },
      },
      {
        onSuccess: () => toast.success("Projet mis à jour"),
        onError: () => toast.error("Erreur de mise à jour"),
      }
    );
  };

  const handleDelete = () => {
    if (!canDelete) {
      toast.error("Vous n'avez pas les droits pour supprimer ce projet.");
      return;
    }

    deleteProject.mutate(projectId!, {
      onSuccess: () => {
        toast.success("Projet supprimé !");
        if (workspace?._id) navigate(`/dashboard/workspaces/${workspace._id}`);
        else navigate("/dashboard");
      },
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  /* --------------------
     Render
     -------------------- */
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <BackButton />
      <h1 className="text-xl font-bold mb-6">Paramètres du projet</h1>

      {/* SECTION 1 — Modifier */}
      <div className="bg-white p-6 rounded-xl shadow border mb-8">
        <h2 className="font-semibold text-lg mb-4">Modifier le projet</h2>

        <div className="mb-4">
          <label className="font-medium">Titre</label>
          <Input
            disabled={!canEdit}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="font-medium">Description</label>
          <Textarea
            disabled={!canEdit}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="font-medium">Date de début</label>
          <Input
            type="date"
            disabled={!canEdit}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="font-medium">Date de fin</label>
          <Input
            type="date"
            disabled={!canEdit}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button disabled={!canEdit} onClick={handleSave}>
          Enregistrer
        </Button>
      </div>

      {/* SECTION 2 — Membres du projet */}
      <div className="bg-white p-6 rounded-xl shadow border mb-8">
        <h2 className="font-semibold text-lg mb-4">Membres du projet</h2>

        <p className="text-sm text-gray-600 mb-3">
          Voici les membres participant à ce projet et leur rôle.
        </p>

        <div className="space-y-3">
          {project.members.map((m) => {
            const userObj = typeof m.user === "string" ? null : (m.user as Utilisateur);
            const userIdKey = getMemberUserId(m.user) ?? Math.random().toString();

            return (
              <div
                key={userIdKey}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{userObj?.name ?? "Utilisateur"}</p>
                  <p className="text-sm text-gray-500">{userObj?.email ?? ""}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    m.role === "manager"
                      ? "bg-blue-100 text-blue-700"
                      : m.role === "contributor"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {m.role}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3 — Suppression */}
      <div className="bg-red-50 p-6 rounded-xl border border-red-300">
        <h2 className="font-semibold text-red-600 text-lg mb-2">Zone à risque</h2>
        <p className="text-sm text-gray-700 mb-4">
          Supprimer définitivement ce projet.
        </p>

        <Button
          variant="destructive"
          disabled={!canDelete}
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          Supprimer le projet
        </Button>
      </div>
    </div>
  );
}
