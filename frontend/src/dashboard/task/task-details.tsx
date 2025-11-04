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
import {
    useAchievedTaskMutation,
    useTaskByIdQuery,
    useWatchTaskMutation,
} from "../../hooks/use-task";
import { useAuth } from "../../fournisseur/auth-context";
import type { Project, Task } from "../../types";
import { format, formatDistanceToNow } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { fr } from "date-fns/locale";

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

    const { data, isLoading } = useTaskByIdQuery(taskId!) as {
        data: {
            task: Task;
            project: Project;
        };
        isLoading: boolean;
    };
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
                                    Créé {formatDistanceToNow(new Date(task.createdAt), {
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

                        <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
                    </div>

                    <CommentSection taskId={task._id} members={project.members as any} />
                </div>

                <div className="lg:w-1/3 w-full space-y-6">
                    <Watchers watchers={task.watchers || []} />
                    <TaskActivity resourceId={task._id} />
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
