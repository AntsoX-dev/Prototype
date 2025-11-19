
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetWorkspaceDetailsQuery,
  useUpdateWorkspaceMutation,
  useTransferWorkspaceMutation,
  useDeleteWorkspaceMutation,
} from "../../hooks/use-workspace";
import { useAuth } from "../../fournisseur/auth-context";
import { Button } from "../../components/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { colorOptions } from "../../components/workspace/create-workspace";
import { toast } from "sonner";
import { cn } from "../../libs/utils";
import type { Utilisateur, Workspace } from "../../types";

// 🔹 Utilitaire pour obtenir l'ID du propriétaire
const getOwnerId = (owner: string | Utilisateur) =>
  typeof owner === "string" ? owner : owner._id;

const Settings = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();

  // 🔹 Récupération du workspace (typé correctement
const { data: workspace, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
  data?: Workspace;
  isLoading: boolean;
};

  // 🔹 Mutations
  const updateMutation = useUpdateWorkspaceMutation();
  const transferMutation = useTransferWorkspaceMutation();
  const deleteMutation = useDeleteWorkspaceMutation();

  // 🔹 États formulaire
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#2563EB");
  const [transferTo, setTransferTo] = useState("");

  // 🔹 Vérifie si l'utilisateur est propriétaire
  const isOwner =
    workspace && utilisateur
      ? getOwnerId(workspace.owner) === utilisateur._id
      : false;

  // 🔹 Pré-remplit les champs quand le workspace est chargé
  useEffect(() => {
    if (workspace) {
      setName(workspace.name ?? "");
      setDescription(workspace.description ?? "");
      setColor(workspace.color ?? "#2563EB");
    }
  }, [workspace]);

  // 🔹 États de chargement / erreur
  if (isLoading) return <p className="p-6">Chargement...</p>;
  if (!workspace) return <p className="p-6 text-red-500">Espace introuvable</p>;

  // 🔹 Mise à jour du workspace
  const handleSave = () => {
    if (!isOwner) return toast.error("Seul le propriétaire peut modifier !");
    updateMutation.mutate(
      {
        workspaceId: workspaceId!,
        payload: { name, description, color },
      },
      {
        onSuccess: () => toast.success("Espace mis à jour !"),
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  // 🔹 Transfert du workspace
  const handleTransfer = () => {
    if (!transferTo) return toast.error("Sélectionnez un membre à transférer !");
    transferMutation.mutate(
      {
        workspaceId: workspaceId!,
        newOwnerId: transferTo,
      },
      {
        onSuccess: () => {
          toast.success("Transfert effectué !");
          setTransferTo("");
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message || "Erreur transfert"),
      }
    );
  };

  // 🔹 Suppression du workspace
  const handleDelete = () => {
    if (!isOwner) return toast.error("Seul le propriétaire peut supprimer !");
    deleteMutation.mutate(workspaceId!, {
      onSuccess: () => {
        toast.success("Espace supprimé !");
        navigate("/dashboard/workspaces");
      },
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Paramètres de l’espace de travail</h1>

      {/* 🔸 Section modification */}
      <div className="bg-white p-6 rounded-xl shadow border mb-8">
        <h2 className="font-semibold text-lg mb-4">Modifier l’espace</h2>

        <div className="mb-4">
          <label className="font-medium">Nom</label>
          <Input
            disabled={!isOwner}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="font-medium">Description</label>
          <Textarea
            disabled={!isOwner}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="font-medium">Couleur</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {colorOptions.map((c: string) => (
              <div
                key={c}
                onClick={() => isOwner && setColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "h-7 w-7 rounded-full cursor-pointer transition-all",
                  color === c && "ring-2 ring-offset-2 ring-blue-600"
                )}
              />
            ))}
          </div>
        </div>

        <Button disabled={!isOwner} onClick={handleSave}>
          Enregistrer
        </Button>
      </div>

      {/* 🔸 Section transfert */}
      <div className="bg-white p-6 rounded-xl shadow border mb-8">
        <h2 className="font-semibold text-lg mb-4">Transférer l’espace</h2>
        <p className="text-sm text-gray-600 mb-3">
          Transférer la propriété de l’espace à un membre.
        </p>

        <select
          disabled={!isOwner}
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">Choisir un membre...</option>
          {workspace.members?.map((m: { user: Utilisateur }) => (
            <option key={m.user._id} value={m.user._id}>
              {m.user.name} — {m.user.email}
            </option>
          ))}
        </select>

        <Button disabled={!isOwner || !transferTo} onClick={handleTransfer}>
          Transférer
        </Button>
      </div>

      {/* 🔸 Section suppression */}
      <div className="bg-red-50 p-6 rounded-xl border border-red-300">
        <h2 className="font-semibold text-red-600 text-lg mb-2">Zone à risque</h2>
        <p className="text-sm text-gray-700 mb-4">
          Supprimer cet espace définitivement.
        </p>

        <Button
          variant="destructive"
          disabled={!isOwner}
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          Supprimer l’espace
        </Button>
      </div>
    </div>
  );
};

export default Settings;
