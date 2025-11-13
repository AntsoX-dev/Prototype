import { BackButton } from "../../components/back-button";
import { Loader } from "../../components/loader";
import { CommentSection } from "../../components/task/comment-section";
import { SubTasksDetails } from "../../components/task/sub-tasks";
import { TaskActivity } from "../../components/task/task-activity";
import { TaskAssigneesSelector } from "../../components/task/task-assignees-selector";
import { TaskDescription } from "../../components/task/task-description";
import { TaskPrioritySelector } from "../../components/task/task-priority-selector";
import { TaskStatusSelector } from "../../components/task/task-status-selector";
import { TaskTitle } from "../../components/task/task-title";
import { Watchers } from "../../components/task/watchers";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/button";
import { AddLinkDialog } from "../../components/ui/AddLinkDialog";
import { UploadAttachmentDialog } from "../../components/ui/UploadAttachmentDialog";
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
  useAddAttachmentMutation,
} from "../../hooks/use-task";
import { useAuth } from "../../fournisseur/auth-context";
import type { Project, Task } from "../../types";
import { format, formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, File, Link, Paperclip, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { fr } from "date-fns/locale";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

// Style dropdown
const buttonClasses =
  "flex gap-2 text-sm items-center justify-start text-black hover:underline underline-offset-2 hover:border-1 hover:border-gray-300 px-2 py-1.5 rounded-md transition-colors";

const contentClasses =
  "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-2 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

const itemClasses =
  "relative flex cursor-default select-none items-center justify-start gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

// Fin style dropdown

const translatePriority = (priority?: "Low" | "Medium" | "High") => {
  switch (priority) {
    case "Low":
      return "Basse";
    case "Medium":
      return "Normale";
    case "High":
      return "Haute";
    default:
      return "Inconnue";
  }
};

const TaskDetails = () => {
  const { utilisateur } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
    refetch: () => void;
  };

  const { mutate: addAttachment, isPending: isUploading } =
    useAddAttachmentMutation();
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Tâche non trouvée</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === utilisateur?._id.toString()
  );

  const goBack = () => navigate(-1);

  const members = task?.assignees || [];

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Tâche suivie");
        },
        onError: () => {
          toast.error("Echec du suivi de la tâche");
        },
      }
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Tâche accomplie");
        },
        onError: () => {
          toast.error("Impossible d'accomplir la tâche");
        },
      }
    );
  };

  const handleAttachmentUpload = async (file: File, customName: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customName", customName);

    return new Promise<void>((resolve, reject) => {
      addAttachment(
        { taskId: task._id, formData: formData } as any, // Cast pour éviter les erreurs de type si `formData` n'est pas l'unique type attendu
        {
          onSuccess: () => {
            toast.success(`La pièce jointe "${customName}" a été ajoutée.`);
            setIsUploadDialogOpen(false);
            resolve();
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message ||
              "Erreur lors de l'ajout de la pièce jointe.";
            toast.error(errorMessage);
            reject(error);
          },
        }
      );
    });
  };

  const handleLinkAddition = async (url: string, customName: string) => {
    const linkPayload = {
      customName,
      fileUrl: url,
    };

    return new Promise<void>((resolve, reject) => {
      addAttachment(
        { taskId: task._id, payload: linkPayload } as any,
        {
          onSuccess: () => {
            toast.success(`Le lien "${customName}" a été ajouté.`);
            setIsLinkDialogOpen(false);
            resolve();
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message ||
              "Erreur lors de l'ajout du lien.";
            toast.error(errorMessage);
            reject(error);
          },
        }
      );
    });
  };

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archivé
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handleWatchTask}
            className="w-fit"
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Ne plus suivre
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Suivre
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            onClick={handleAchievedTask}
            className="w-fit"
            disabled={isAchieved}
          >
            {task.isArchived ? "Désarchiver" : "Archiver"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 w-full">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <Badge
                  variant={
                    task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                        ? "default"
                        : "outline"
                  }
                  className="mb-2 capitalize"
                >
                  Priorité {translatePriority(task.priority)}
                </Badge>

                <TaskTitle title={task.title} taskId={task._id} />

                <div className="text-sm md:text-base text-muted-foreground">
                  Créé{" "}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TaskStatusSelector status={task.status} taskId={task._id} />

                <Button
                  variant={"destructive"}
                  size="sm"
                  onClick={() => { }}
                  className="hidden md:block"
                >
                  Supprimer la tâche
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
              />
            </div>

            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees ?? []}
              projectMembers={project.members as any}
            />

            <TaskPrioritySelector
              priority={task.priority ?? "Low"}
              taskId={task._id}
            />
            <div className="my-4 flex flex-col gap-3 items-center justify-center p-4 bg-stone-50 rounded-xl">
              <div className="flex w-full justify-between items-center ">
                <h3 className="flex gap-2 text-sm items-center justify-start text-muted-foreground">
                  <Paperclip size={16} />
                  Pièces jointes ({task.attachments?.length || 0}){" "}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={buttonClasses}>
                      <Plus size={16} />
                      {isUploading ? "Envoi..." : "Ajouter"}
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className={contentClasses}>
                    <DropdownMenuItem
                      className={itemClasses}
                      onClick={() => setIsUploadDialogOpen(true)}
                      disabled={isUploading}
                    >
                      <File size={14} />
                      <span>Ajouter un fichier</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={itemClasses}
                      onClick={() => setIsLinkDialogOpen(true)}
                      disabled={isUploading}
                    >
                      <Link size={14} />
                      <span>Ajouter un lien</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Affichage des pièces jointes existantes */}
              {task.attachments && task.attachments.length > 0 ? (
                <ul className="w-full space-y-2">
                  {task.attachments.map((attachment) => (
                    <li
                      key={attachment.fileUrl}
                      className="flex items-center justify-between p-2 border rounded-md bg-white"
                    >
                      <span className="text-sm font-medium truncate">
                        {attachment.fileName}
                      </span>
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-600 underline mr-4"
                      >
                        Voir
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <h3 className="grow text-center text-sm text-muted-foreground">
                  Aucune pièce jointe
                </h3>
              )}
            </div>

            <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
          </div>

          <CommentSection taskId={task._id} members={project.members as any} />
        </div>

        <div className="lg:w-1/3 w-full space-y-6">
          <Watchers watchers={task.watchers || []} />
          <TaskActivity resourceId={task._id} />
        </div>
      </div>

      <UploadAttachmentDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleAttachmentUpload}
      />

      <AddLinkDialog
        isOpen={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        onAddLink={handleLinkAddition}
      />
    </div>
  );
};

export default TaskDetails;
