import { Link } from "react-router-dom";
import type { Project } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "../../libs/utils";
import { getTaskStatusColor } from "../../libs";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

const getTaskStatusLabel = (status: string) => {
    switch (status) {
        case "Planning":
            return "En planification";
        case "In Progress":
            return "En cours";
        case "On Hold":
            return "En attente";
        case "Completed":
            return "Terminé";
        case "Cancelled":
            return "Annulé";
        default:
            return status;
    }
};

interface ProjectCardProps {
    project: Project;
    progress: number;
    workspaceId: string;
}

export const ProjectCard = ({
    project,
    progress,
    workspaceId,
}: ProjectCardProps) => {
    return (
        <Link to={`/dashboard/workspaces/${workspaceId}/projects/${project._id}`}>
            <Card className="transition-all duration-300 hover:shadow-md hover:translate-y-1">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{project.title}</CardTitle>
                        <span
                            className={cn(
                                "text-xs rounded-full px-2 py-1",
                                getTaskStatusColor(project.status)
                            )}
                        >
                            {getTaskStatusLabel(project.status)}
                        </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                        {project.description || "Aucune description"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Progression</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm gap-2 text-muted-foreground">
                                <span>{project.tasks.length}</span>
                                <span>Tâches</span>
                            </div>

                            {project.dueDate && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>{format(project.dueDate, "MMM d, yyyy")}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};
