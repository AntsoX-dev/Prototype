import type { Task } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/Card";
import { cn } from "../lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const UpcomingTasks = ({ data }: { data: Task[] }) => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspaceId") ?? "";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tâches à venir</CardTitle>
                <CardDescription>
                    Voici les tâches dont l’échéance approche
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {data.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        Aucune tâche à venir pour le moment
                    </p>
                ) : (
                    data.map((task) => (
                        <Link
                            to={`/dashboard/workspaces/${workspaceId}/projects/${task.project}/tasks/${task._id}`}
                            key={task._id}
                            className="flex items-start space-x-3 border-b pb-3 last:border-0"
                        >
                            <div
                                className={cn(
                                    "mt-0.5 rounded-full p-1",
                                    task.priority === "High" && "bg-red-100 text-red-700",
                                    task.priority === "Medium" && "bg-yellow-100 text-yellow-700",
                                    task.priority === "Low" && "bg-gray-100 text-gray-700"
                                )}
                            >
                                {task.status === "Done" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : task.status === "In Progress" ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : task.status === "To Do" ? (
                                    <Circle className="w-4 h-4" />
                                ) : (
                                    <Circle className="w-4 h-4" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <p className="font-medium text-sm md:text-base">{task.title}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <span>
                                        {task.status === "To Do"
                                            ? "À faire"
                                            : task.status === "In Progress"
                                                ? "En cours"
                                                : task.status === "Done"
                                                    ? "Terminé"
                                                    : task.status}
                                    </span>

                                    {task.dueDate && (
                                        <>
                                            <span className="mx-1"> - </span>
                                            <span>
                                                {format(new Date(task.dueDate), "d MMM yyyy", {
                                                    locale: fr,
                                                })}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
